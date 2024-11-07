/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, injectable} from '@loopback/core';
import {AnyObject, repository} from '@loopback/repository';
import {
  BlockCheckResult,
  ConditionBlock,
  ConditionBlockProperty,
  ConditionBlocks,
  EngineerItemBlock,
  EnumConditionMode,
  UserLicenseItem,
} from '../dto';
import {
  BuildingGroupCondition,
  BuildingProject,
  EnumStatus,
  Profile,
  Profiles,
} from '../models';
import {
  BuildingGroupConditionRepository,
  ProfileRepository,
} from '../repositories';
import {HttpErrors} from '@loopback/rest';

@injectable({scope: BindingScope.APPLICATION})
export class BlockCheckerService {
  static readonly BINDING_KEY = BindingKey.create<BlockCheckerService>(
    `services.${BlockCheckerService.name}`,
  );

  constructor(
    @repository(ProfileRepository) private profileRepo: ProfileRepository,
    @repository(BuildingGroupConditionRepository)
    private buildingGroupConditionRepo: BuildingGroupConditionRepository,
  ) {}

  private static hasLicenseLevel(
    engineer: Profile,
    licenseType: string,
    licenseLevels: string[],
    now = new Date(),
  ): UserLicenseItem | undefined {
    const {licenses} = {licenses: [], ...engineer.meta};
    return licenses
      .filter(
        (l: AnyObject) =>
          l.status === 6 &&
          l.license_type === licenseType &&
          licenseLevels.includes(l.license_level) &&
          new Date(l.license_exp) >= now,
      )
      .map(
        (l: AnyObject) =>
          new UserLicenseItem({
            id: engineer.id?.toString(),
            type: l.license_type,
            level: l.license_level,
          }),
      )
      .at(0);
  }

  private static hasLicenseType(
    engineer: Profile,
    licenseTypes: string[],
    now = new Date(),
  ): UserLicenseItem | undefined {
    const {licenses} = {licenses: [], ...engineer.meta};
    return licenses
      .filter(
        (l: AnyObject) =>
          l.status === 6 &&
          licenseTypes.includes(l.license_type) &&
          new Date(l.license_exp) >= now,
      )
      .map(
        (l: AnyObject) =>
          new UserLicenseItem({
            id: engineer.id?.toString(),
            type: l.license_type,
            level: l.license_level,
          }),
      )
      .at(0);
  }

  private static FALSE_RESULT = new BlockCheckResult({
    passed: false,
    selectedEngineers: [],
  });

  private project: BuildingProject;
  private engineers: Profiles;
  private block: BuildingGroupCondition;
  private mode: EnumConditionMode;
  private allowedEngineerTypes: string[] = [];

  async analyze(
    project: BuildingProject,
    mode: EnumConditionMode = EnumConditionMode.CHECK_ENGINEERS,
    allowedEngineerTypes: string[] = [],
  ): Promise<BlockCheckResult> {
    this.project = project;
    this.allowedEngineerTypes = allowedEngineerTypes;
    this.mode = mode;
    this.engineers = await this.getActiveEngineers();
    this.block = await this.getConditionBlock();

    const result = this.analyzeBlock(
      this.block.data as ConditionBlock,
      this.filteredEngineers,
    );
    if (
      this.mode === EnumConditionMode.CHECK_ENGINEERS &&
      result.selectedEngineers.length !== this.engineers.length
    ) {
      return BlockCheckerService.FALSE_RESULT;
    }
    return result;
  }

  private async getConditionBlock(): Promise<BuildingGroupCondition> {
    const result =
      this.project.activeBuildingGroupCondition &&
      (await this.buildingGroupConditionRepo.findById(
        this.project.activeBuildingGroupCondition?.condition_id,
      ));
    if (!result) {
      throw new HttpErrors.UnprocessableEntity('Invalid condition group');
    }
    return result;
  }

  private getActiveEngineers(): Promise<Profiles> {
    const activeStaff = this.project.staff
      ?.filter(
        staff =>
          [EnumStatus.ACCEPTED, EnumStatus.PENDING].includes(staff.status) &&
          (this.allowedEngineerTypes.length === 0 ||
            this.allowedEngineerTypes.includes(staff.field_id.toString())),
      )
      .map(staff => staff.user_id);
    return this.profileRepo.find({where: {user_id: {inq: activeStaff}}});
  }

  private get filteredEngineers(): Profiles {
    return this.allowedEngineerTypes.length
      ? this.engineers.filter((eng: Profile) =>
          BlockCheckerService.hasLicenseType(eng, this.allowedEngineerTypes),
        )
      : this.engineers;
  }

  private getProp<T = unknown, E = AnyObject>(
    block: AnyObject,
    propName: string,
    defaultValue = null,
  ): [T, E] {
    const prop = block['properties'].find(
      (p: AnyObject) => p.title === propName,
    );
    return [prop.value ?? defaultValue, prop];
  }

  private getRemainedEngineers(
    engineers: Profiles,
    selectedEngineers: Profiles,
  ): Profiles {
    const selectedEngineersId = selectedEngineers.map(e => e.id);
    return engineers.filter(e => !selectedEngineersId.includes(e.id));
  }

  private getAvailableChildren(block: ConditionBlock): ConditionBlocks {
    return this.allowedEngineerTypes.length
      ? (block.children.filter(
          (child: ConditionBlock) =>
            child.type !== 'engineer_item' ||
            this.allowedEngineerTypes.includes(child.id),
        ) ?? [])
      : (block.children ?? []);
  }

  private analyzeBlock(
    block: ConditionBlock,
    engineers: Profiles,
  ): BlockCheckResult {
    switch (block.type) {
      case 'block':
        return this.checkBlock(block, engineers);
      case 'engineer_item':
        return this.checkEngineerItem(block, engineers);
      default:
        return new BlockCheckResult({passed: false, selectedEngineers: []});
    }
  }

  private checkBlock(
    block: ConditionBlock,
    engineers: Profiles,
  ): BlockCheckResult {
    // Make a clone
    const selectedEngineers = [];

    /// TODO: Check for is_mandatory
    const [cond_type] = this.getProp(block, 'condition');
    const availableChildren = this.getAvailableChildren(block);

    for (const child of availableChildren) {
      const childResult = this.analyzeBlock(
        child,
        this.getRemainedEngineers(engineers, selectedEngineers),
      );

      if (cond_type === 'or') {
        if (childResult.passed) {
          return childResult;
        }
      } else if (cond_type === 'and') {
        if (!childResult.passed) {
          return BlockCheckerService.FALSE_RESULT;
        }
        selectedEngineers.push(...childResult.selectedEngineers);
      }
    }

    return new BlockCheckResult({passed: true, selectedEngineers});
  }

  private checkEngineerItem(
    block: EngineerItemBlock,
    selectedEngineers: Profiles,
  ): BlockCheckResult {
    const requiredEngineers = this.getRequiredEngineers(block);
    selectedEngineers = selectedEngineers.filter((eng: Profile) =>
      BlockCheckerService.hasLicenseLevel(
        eng,
        requiredEngineers.type,
        requiredEngineers.levels,
      ),
    );
    const passed =
      this.mode === EnumConditionMode.MODIFY_ENGINEERS
        ? selectedEngineers.length > 0 &&
          selectedEngineers.length <= requiredEngineers.count
        : selectedEngineers.length === requiredEngineers.count;
    return new BlockCheckResult({passed, selectedEngineers});
  }

  private getRequiredEngineers(engineerItem: EngineerItemBlock): {
    type: string;
    levels: string[];
    count: number;
  } {
    // Required engineers count
    const [area_space] = this.getProp<string>(engineerItem, 'refTotalMeterage');
    const count = Math.ceil(
      this.project.specification.total_area / +area_space,
    );

    // refLicenseLevel
    const [value, levelProps] = this.getProp<string, ConditionBlockProperty>(
      engineerItem,
      'refLicenseLevel',
    );
    const levels = this.getRequiredLevels(levelProps, value);

    return {type: engineerItem.id, levels, count};
  }

  private getRequiredLevels(
    engineerItem: ConditionBlockProperty,
    value: string,
  ): string[] {
    const selectedItem = engineerItem.options?.find(
      (item: AnyObject) => item.value.toString() === value.toString(),
    );
    if (!selectedItem) {
      return [];
    }

    const res =
      engineerItem.options
        ?.sort((a: AnyObject, b: AnyObject) => +a.order - +b.order)
        .filter((item: AnyObject) => item.order <= selectedItem.order)
        .map((item: AnyObject) => item.value) ?? [];
    return res;
  }
}
