import {
  UserModel,
  PropertyModel,
  RoomModel,
  BookingRequestModel,
  TiffinModel,
  TiffinInterestModel,
  CollabRequestModel,
  ReviewModel,
  MessageModel,
  NotificationModel,
  SupportTicketModel,
  SystemSettingModel,
  OtpModel
} from './mongoose-models';

class PrismaMongooseModel {
  constructor(private mongooseModel: any, private relationKeys: Record<string, string> = {}) {}

  private mapPrismaWhere(where: any) {
    if (!where) return {};
    const query: any = {};
    for (const key of Object.keys(where)) {
      const val = where[key];
      if (key === 'id') {
        query['_id'] = val;
      } else if (key === 'OR' && Array.isArray(val)) {
        query['$or'] = val.map(item => this.mapPrismaWhere(item));
      } else if (key === 'AND' && Array.isArray(val)) {
        query['$and'] = val.map(item => this.mapPrismaWhere(item));
      } else if (key === 'NOT' && typeof val === 'object') {
        query['$ne'] = this.mapPrismaWhere(val);
      } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        if ('contains' in val) {
          query[key] = { $regex: val.contains, $options: val.mode === 'insensitive' ? 'i' : '' };
        } else if ('gt' in val) {
          query[key] = { $gt: val.gt };
        } else if ('gte' in val) {
          query[key] = { $gte: val.gte };
        } else if ('lt' in val) {
          query[key] = { $lt: val.lt };
        } else if ('lte' in val) {
          query[key] = { $lte: val.lte };
        } else if ('in' in val) {
          query[key] = { $in: val.in };
        } else if ('not' in val) {
          if (typeof val.not === 'object') {
            query[key] = { $ne: this.mapPrismaWhere(val.not) };
          } else {
            query[key] = { $ne: val.not };
          }
        } else {
          query[key] = val;
        }
      } else {
        query[key] = val;
      }
    }
    return query;
  }

  private applyPopulate(query: any, include: any) {
    if (!include) return query;
    for (const relation of Object.keys(include)) {
      if (include[relation]) {
        // Map relation name to database schema key if needed
        // e.g. 'owner' in Prisma maps to Mongoose field 'ownerId'
        const mongooseKey = this.relationKeys[relation] || relation;
        
        const selectObj = include[relation].select;
        let selectStr = '';
        if (selectObj) {
          selectStr = Object.keys(selectObj).filter(k => selectObj[k]).join(' ');
        }
        
        query = query.populate({
          path: mongooseKey,
          select: selectStr || undefined
        });
      }
    }
    return query;
  }

  private applySort(query: any, orderBy: any) {
    if (!orderBy) return query;
    const sort: any = {};
    if (Array.isArray(orderBy)) {
      for (const item of orderBy) {
        for (const key of Object.keys(item)) {
          sort[key === 'id' ? '_id' : key] = item[key] === 'desc' ? -1 : 1;
        }
      }
    } else {
      for (const key of Object.keys(orderBy)) {
        sort[key === 'id' ? '_id' : key] = orderBy[key] === 'desc' ? -1 : 1;
      }
    }
    return query.sort(sort);
  }

  private toPrismaResult(doc: any) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    obj.id = obj._id;
    
    // Map populated relation keys back to Prisma naming
    // e.g. if 'ownerId' is populated as an object, map it to `owner` and restore `ownerId` to its string ID.
    for (const relationName of Object.keys(this.relationKeys)) {
      const mongooseKey = this.relationKeys[relationName];
      if (obj[mongooseKey] && typeof obj[mongooseKey] === 'object') {
        const relatedDoc = obj[mongooseKey];
        obj[relationName] = { ...relatedDoc, id: relatedDoc._id };
        obj[mongooseKey] = relatedDoc._id;
      }
    }
    return obj;
  }

  async findUnique(options?: any) {
    const where = this.mapPrismaWhere(options?.where);
    let q = this.mongooseModel.findOne(where);
    q = this.applyPopulate(q, options?.include);
    const doc = await q.exec();
    return this.toPrismaResult(doc);
  }

  async findFirst(options?: any) {
    const where = this.mapPrismaWhere(options?.where);
    let q = this.mongooseModel.findOne(where);
    q = this.applyPopulate(q, options?.include);
    q = this.applySort(q, options?.orderBy);
    const doc = await q.exec();
    return this.toPrismaResult(doc);
  }

  async findMany(options?: any) {
    const where = this.mapPrismaWhere(options?.where);
    let q = this.mongooseModel.find(where);
    q = this.applyPopulate(q, options?.include);
    q = this.applySort(q, options?.orderBy);
    if (options?.take) {
      q = q.limit(options.take);
    }
    if (options?.skip) {
      q = q.skip(options.skip);
    }
    const docs = await q.exec();
    return docs.map((d: any) => this.toPrismaResult(d));
  }

  async create(options?: any) {
    const data = { ...options?.data };
    if (data.id) {
      data._id = data.id;
      delete data.id;
    }
    
    // Replace connecting connect syntax
    for (const key of Object.keys(data)) {
      if (data[key] && typeof data[key] === 'object' && 'connect' in data[key]) {
        const connectId = data[key].connect.id;
        const dbKey = this.relationKeys[key] || (key + 'Id');
        data[dbKey] = connectId;
        delete data[key];
      }
    }

    const doc = await this.mongooseModel.create(data);
    let q = this.mongooseModel.findById(doc._id);
    q = this.applyPopulate(q, options?.include);
    const populated = await q.exec();
    return this.toPrismaResult(populated);
  }

  async update(options?: any) {
    const where = this.mapPrismaWhere(options?.where);
    const data = { ...options?.data };
    
    // Flatten any connection logic if any
    for (const key of Object.keys(data)) {
      if (data[key] && typeof data[key] === 'object' && 'connect' in data[key]) {
        const connectId = data[key].connect.id;
        const dbKey = this.relationKeys[key] || (key + 'Id');
        data[dbKey] = connectId;
        delete data[key];
      }
    }

    const doc = await this.mongooseModel.findOneAndUpdate(where, data, { new: true });
    if (!doc) throw new Error('Record to update not found.');
    let q = this.mongooseModel.findById(doc._id);
    q = this.applyPopulate(q, options?.include);
    const populated = await q.exec();
    return this.toPrismaResult(populated);
  }

  async updateMany(options?: any) {
    const where = this.mapPrismaWhere(options?.where);
    const data = { ...options?.data };
    const res = await this.mongooseModel.updateMany(where, data);
    return { count: res.modifiedCount };
  }

  async delete(options?: any) {
    const where = this.mapPrismaWhere(options?.where);
    const doc = await this.mongooseModel.findOneAndDelete(where);
    if (!doc) throw new Error('Record to delete not found.');
    return this.toPrismaResult(doc);
  }

  async deleteMany(options?: any) {
    const where = this.mapPrismaWhere(options?.where);
    const res = await this.mongooseModel.deleteMany(where);
    return { count: res.deletedCount };
  }

  async count(options?: any) {
    const where = this.mapPrismaWhere(options?.where);
    return this.mongooseModel.countDocuments(where);
  }
}

// Map Prisma relation name to Mongoose schema key
const userRelationKeys = {};
const propertyRelationKeys = { owner: 'ownerId', linkedTiffin: 'linkedTiffinId' };
const roomRelationKeys = { property: 'propertyId' };
const bookingRequestRelationKeys = { user: 'userId', property: 'propertyId' };
const tiffinRelationKeys = { provider: 'providerId' };
const tiffinInterestRelationKeys = { user: 'userId', tiffin: 'tiffinId' };
const collabRequestRelationKeys = { tiffin: 'tiffinId', property: 'propertyId', owner: 'ownerId', provider: 'providerId' };
const reviewRelationKeys = { user: 'userId', property: 'propertyId' };
const messageRelationKeys = { sender: 'senderId', receiver: 'receiverId' };
const supportTicketRelationKeys = { sender: 'senderId' };

const prisma = {
  $connect: async () => {},
  $disconnect: async () => {},
  user: new PrismaMongooseModel(UserModel, userRelationKeys),
  property: new PrismaMongooseModel(PropertyModel, propertyRelationKeys),
  room: new PrismaMongooseModel(RoomModel, roomRelationKeys),
  bookingRequest: new PrismaMongooseModel(BookingRequestModel, bookingRequestRelationKeys),
  tiffin: new PrismaMongooseModel(TiffinModel, tiffinRelationKeys),
  tiffinInterest: new PrismaMongooseModel(TiffinInterestModel, tiffinInterestRelationKeys),
  collabRequest: new PrismaMongooseModel(CollabRequestModel, collabRequestRelationKeys),
  review: new PrismaMongooseModel(ReviewModel, reviewRelationKeys),
  message: new PrismaMongooseModel(MessageModel, messageRelationKeys),
  notification: new PrismaMongooseModel(NotificationModel, {}),
  supportTicket: new PrismaMongooseModel(SupportTicketModel, supportTicketRelationKeys),
  systemSetting: new PrismaMongooseModel(SystemSettingModel, {}),
  otp: new PrismaMongooseModel(OtpModel, {})
};

export default prisma;
