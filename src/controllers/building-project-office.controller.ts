import {repository} from '@loopback/repository';
import {param, get, getModelSchemaRef} from '@loopback/rest';
import {BuildingProject, Office} from '../models';
import {BuildingProjectRepository} from '../repositories';

export class BuildingProjectOfficeController {
  constructor(
    @repository(BuildingProjectRepository)
    public buildingProjectRepository: BuildingProjectRepository,
  ) {}

  @get('/building-projects/{id}/office', {
    responses: {
      '200': {
        description: 'Office belonging to BuildingProject',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Office),
          },
        },
      },
    },
  })
  async getOffice(
    @param.path.string('id') id: typeof BuildingProject.prototype.id,
  ): Promise<Office> {
    return this.buildingProjectRepository.office(id);
  }
}
