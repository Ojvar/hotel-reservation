import {
  BindingKey,
  /* inject, */ BindingScope,
  injectable,
} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {EnumConditionMode} from '../dto';
import {BuildingGroupCondition, BuildingProject} from '../models';

@injectable({scope: BindingScope.REQUEST})
export class BlockCheckerService {
  static readonly BINDING_KEY = BindingKey.create<BlockCheckerService>(
    `services.${BlockCheckerService.name}`,
  );

  // private static hasLicenseLevel(
  //   engineer: Profile,
  //   licenseType: string,
  //   licenseLevels: string[],
  //   now = new Date(),
  // ): UserLicenseItem | undefined {
  //   const {licenses} = {licenses: [], ...engineer.meta};
  //   return licenses
  //     .filter(
  //       (l: any) =>
  //         l.status === 6 &&
  //         l.license_type === licenseType &&
  //         licenseLevels.includes(l.license_level) &&
  //         new Date(l.license_exp) >= now,
  //     )
  //     .map(
  //       (l: any) =>
  //         new UserLicenseItem({
  //           id: engineer.id?.toString(),
  //           type: l.license_type,
  //           level: l.license_level,
  //         }),
  //     )
  //     .at(0);
  // }

  // private static hasLicenseType(
  //   engineer: Profile,
  //   licenseTypes: string[],
  //   now = new Date(),
  // ): UserLicenseItem | undefined {
  //   const {licenses} = {licenses: [], ...engineer.meta};
  //   return licenses
  //     .filter(
  //       (l: any) =>
  //         l.status === 6 &&
  //         licenseTypes.includes(l.license_type) &&
  //         new Date(l.license_exp) >= now,
  //     )
  //     .map(
  //       (l: any) =>
  //         new UserLicenseItem({
  //           id: engineer.id?.toString(),
  //           type: l.license_type,
  //           level: l.license_level,
  //         }),
  //     )
  //     .at(0);
  // }

  // private static FALSE_RESULT = new BlockCheckResult({
  //   passed: false,
  //   selectedEngineers: [],
  // });

  // private project: BuildingProject;
  // private engineers: Profiles;
  // private block: BuildingGroupCondition;
  // private mode: EnumConditionMode;
  // private allowedEngineerTypes: string[] = [];

  // constructor() {}

  analyze(
    project: BuildingProject,
    block: BuildingGroupCondition,
    mode: EnumConditionMode,
    allowedEngineerTypes: string[] = [],
  ): AnyObject {
    return {};
  }

  // analyze(
  //   project: BuildingProject,
  //   block: BuildingGroupCondition,
  //   mode: EnumConditionMode,
  //   allowedEngineerTypes: string[] = [],
  // ): BlockCheckResult {
  //   this.project = project;
  //   this.engineers = this.getActiveEngineers();
  //   this.block = block;
  //   this.mode = mode;
  //   this.allowedEngineerTypes = allowedEngineerTypes;

  //   const result = this.analyzeBlock(
  //     this.block.data as ConditionBlock,
  //     this.filteredEngineers,
  //   );
  //   if (
  //     this.mode === EnumConditionMode.CHECK_ENGINEERS &&
  //     result.selectedEngineers.length !== this.engineers.length
  //   ) {
  //     return BlockCheckerService.FALSE_RESULT;
  //   }
  //   return result;
  // }

  // private get filteredEngineers(): Profiles {
  //   return this.allowedEngineerTypes.length
  //     ? this.engineers.filter((eng: Profile) =>
  //         BlockCheckerService.hasLicenseType(eng, this.allowedEngineerTypes),
  //       )
  //     : this.engineers;
  // }

  // private getActiveEngineers(): Profiles {
  //   //const activeStaff
  //   return [];
  // }

  // private getProp<T = unknown, E = any>(
  //   block: any,
  //   prop_name: string,
  //   default_value = null,
  // ): [T, E] {
  //   const prop = block['propertise'].find((p: any) => p.title === prop_name);
  //   return [prop.value ?? default_value, prop];
  // }

  // private getRemainedEngineers(
  //   engineers: Profiles,
  //   selected_engineers: Profiles,
  // ): Profiles {
  //   const selected_engineers_id = selected_engineers.map(e => e.id);
  //   return engineers.filter(e => !selected_engineers_id.includes(e.id));
  // }

  // private getAvailableChildren(block: ConditionBlock): ConditionBlocks {
  //   return this.allowedEngineerTypes.length
  //     ? (block.children.filter(
  //         (child: ConditionBlock) =>
  //           child.type !== 'engineer_item' ||
  //           this.allowedEngineerTypes.includes(child.id),
  //       ) ?? [])
  //     : (block.children ?? []);
  // }

  // private analyzeBlock(
  //   block: ConditionBlock,
  //   engineers: Profiles,
  // ): BlockCheckResult {
  //   switch (block.type) {
  //     case 'block':
  //       return this.checkBlock(block, engineers);
  //     case 'engineer_item':
  //       return this.checkEngineerItem(block, engineers);
  //     default:
  //       return new BlockCheckResult({passed: false, selectedEngineers: []});
  //   }
  // }

  // private checkBlock(
  //   block: ConditionBlock,
  //   engineers: Profiles,
  // ): BlockCheckResult {
  //   // Make a clone
  //   const selectedEngineers = [];

  //   /// TODO: Check for is_mandatory
  //   const [cond_type] = this.getProp(block, 'condition');
  //   const availableChildren = this.getAvailableChildren(block);

  //   for (const child of availableChildren) {
  //     const childResult = this.analyzeBlock(
  //       child,
  //       this.getRemainedEngineers(engineers, selectedEngineers),
  //     );

  //     if (cond_type === 'or') {
  //       if (childResult.passed) {
  //         return childResult;
  //       }
  //     } else if (cond_type === 'and') {
  //       if (!childResult.passed) {
  //         return BlockCheckerService.FALSE_RESULT;
  //       }
  //       selectedEngineers.push(...childResult.selectedEngineers);
  //     }
  //   }
  //   return new BlockCheckResult({passed: true, selectedEngineers});
  // }

  // private checkEngineerItem(
  //   block: EngineerItemBlock,
  //   selectedEngineers: Profiles,
  // ): BlockCheckResult {
  //   const requiredEngineers = this.get_required_engineers(block);
  //   selectedEngineers = selectedEngineers.filter((eng: Profile) =>
  //     BlockCheckerService.hasLicenseLevel(
  //       eng,
  //       requiredEngineers.type,
  //       requiredEngineers.levels,
  //     ),
  //   );
  //   const passed =
  //     this.mode === EnumConditionMode.MODIFY_ENGINEERS
  //       ? selectedEngineers.length <= requiredEngineers.count
  //       : selectedEngineers.length === requiredEngineers.count;
  //   return new BlockCheckResult({passed, selectedEngineers});
  // }

  // private get_required_engineers(engineer_item: EngineerItemBlock): {
  //   type: string;
  //   levels: string[];
  //   count: number;
  // } {
  //   // Required engineers count
  //   const [area_space] = this.getProp<string>(
  //     engineer_item,
  //     'refTotalMeterage',
  //   );
  //   const count = Math.ceil(
  //     this.project.specification.total_area / +area_space,
  //   );

  //   // refLicenseLevel
  //   const [value, levels_props] = this.getProp<string>(
  //     engineer_item,
  //     'refLicenseLevel',
  //   );
  //   const levels = this.get_required_levels(levels_props, value);

  //   return {type: engineer_item.id, levels, count};
  // }

  // private get_required_levels(
  //   engineerItem: ConditionBlockProperty,
  //   value: string,
  // ): string[] {
  //   const selectedItem = engineerItem.options?.find(
  //     (item: any) => item.value === value,
  //   );
  //   if (!selectedItem) {
  //     return [];
  //   }
  //   return (
  //     engineerItem.options
  //       ?.sort((a: any, b: any) => a.order - b.order)
  //       .filter((item: any) => item.order <= selectedItem.order)
  //       .map((item: any) => item.value) ?? []
  //   );
  // }
}
