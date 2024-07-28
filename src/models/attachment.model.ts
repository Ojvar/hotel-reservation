import {AnyObject, model} from '@loopback/repository';
import {
  Attachment as BaseAttachemnts,
  AttachmentItem as BaseAttachmentItem,
  ModifyStamp,
} from '../lib-models/src';

@model()
export class AttachmentItem extends BaseAttachmentItem {
  constructor(data?: Partial<AttachmentItem>) {
    super(data);
  }

  static fromObject(obj: AnyObject): AttachmentItem {
    return new AttachmentItem({
      created: obj.created,
      deleted: obj.deleted,
      id: obj.id,
    });
  }
}
export type Attachments = Record<string, AttachmentItem>;

export class Attachment extends BaseAttachemnts {
  constructor(data?: Partial<Attachment>) {
    super(data);
  }

  setAttachments(attachments: Attachments) {
    if (!this.attachments) {
      this.attachments = {};
    }
    for (const key in attachments) {
      const attachment = attachments[key];
      this.attachments[key] = attachment;
    }
  }

  deleteAttachments(userId: string, deletedAttachments: string[]) {
    if (!this.attachments) {
      return;
    }
    this.history = this.history ?? [];
    this.history.push({
      updated: this.updated!,
      attachments: this.attachments,
    });
    if (this.attachments) {
      for (const key of deletedAttachments) {
        delete this.attachments[key];
      }
    }
    this.updated = new ModifyStamp({at: new Date(), by: userId});
  }
}
export interface AttachmentRelations {}
export type AttachmentWithRelations = Attachment & AttachmentRelations;
