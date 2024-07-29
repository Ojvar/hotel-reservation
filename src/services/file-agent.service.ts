/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {
  AllowedFile,
  AllowedFiles,
  Credential,
  FileInfoDTO,
  FileInfoListDTO,
  FileService,
  FileServiceDataSource,
  FileServiceDataSourceConfig,
  FileServiceProvider,
  FileTokenResponse,
} from '../lib-file-service/src';
import {KeycloakAgentService} from '../lib-keycloak/src';

export const EXPIRE_TIME = 600; // 10 Minutes
export const MAX_SIZE = 16777216; // 2MB -> 2 * 1024 * 1024 * 8;
export const MIME_TYPE = 'image/*';

export type AttachmentItems = Record<string, string>;

@injectable({scope: BindingScope.REQUEST})
export class FileServiceAgentService {
  static BINDING_KEY = BindingKey.create<FileServiceAgentService>(
    `services.${FileServiceAgentService.name}`,
  );

  constructor(
    @inject(FileServiceProvider.BINDING_KEY) private fileService: FileService,
    @inject(FileServiceDataSource.BINDING_KEY)
    private fileServiceDataSourceConfig: FileServiceDataSourceConfig,
    @inject(KeycloakAgentService.BINDING_KEY)
    private keycloakAgentService: KeycloakAgentService,
  ) {}

  static generateAllowedFile(
    field: string,
    maxSize = MAX_SIZE,
    mimeType = MIME_TYPE,
    isPrivate = true,
    replaceWith: string | undefined = undefined,
  ): AllowedFile {
    return new AllowedFile({
      field,
      max_size: maxSize,
      mime_type: mimeType,
      is_private: isPrivate,
      replace_with: replaceWith,
    });
  }

  async getFileToken(
    allowedFiles: AllowedFiles,
    allowedUser: string,
    expireTime = EXPIRE_TIME,
  ): Promise<FileTokenResponse> {
    const {access_token} = await this.keycloakAgentService.getAdminToken();
    return this.fileService.getFileToken(
      access_token,
      allowedFiles,
      allowedUser,
      expireTime,
    );
  }

  async getFilesInformation(
    filesList: string[],
    baseUrl: string | undefined = this.fileServiceDataSourceConfig.baseURL,
  ): Promise<FileInfoListDTO> {
    const {access_token} = await this.keycloakAgentService.getAdminToken();
    const result = await this.fileService.getFilesInfo(access_token, filesList);
    return result.map((x: FileInfoDTO) => {
      const fileInfo = new FileInfoDTO(x);
      if (baseUrl) {
        fileInfo.updateAccessUrl(baseUrl);
      }
      return fileInfo;
    });
  }

  async getAttachments(
    userId: string,
    fileToken: string,
  ): Promise<Credential | null> {
    if (!fileToken || !userId) {
      return null;
    }
    const {access_token} = await this.keycloakAgentService.getAdminToken();
    return this.fileService.getUploadInfo(access_token, userId, fileToken);
  }

  // async getAttachmentsLocal(
  //   fileToken: string,
  //   attachments?: Credential,
  // ): Promise<[AttachmentItems, Credential | null]> {
  //   const { sub: userId } = await this.keycloakSecurity.getUserInfo();
  //   const uploadedFiles =
  //     attachments ?? (await this.getAttachments(userId, fileToken));
  //
  //   if (!uploadedFiles) {
  //     return [{}, null];
  //   }
  //
  //   const localAttachments =
  //     uploadedFiles.uploaded_files.reduce<AttachmentItems>(
  //       (result, item) => ({ ...result, [item.fieldname]: item.id }),
  //       {},
  //     );
  //   return [localAttachments, uploadedFiles];
  // }

  async commit(userId: string, fileToken: string): Promise<void> {
    const {access_token} = await this.keycloakAgentService.getAdminToken();
    return this.fileService.commit(access_token, userId, fileToken);
  }
}
