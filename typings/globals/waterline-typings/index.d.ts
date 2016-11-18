// Generated by typings
// Source: node_modules/waterline-typings/index.d.ts
declare namespace Waterline {
    interface Adapter {

    }
    type Connection = {
        adapter: string;
    }
    interface Config {
        adapters: { [index: string]: Adapter };
        connections: { [index: string]: Connection }
    }
    type Ontology = {
        collections: any;
    }
    interface Waterline {
        loadCollection(collection: CollectionClass);
        initialize: (config: Config, cb: (err: Error, ontology: Ontology) => any) => any;
        collections: any;
    }
    interface WaterlineStatic {
        Collection: {
            extend: (params: CollectionDefinitions) => CollectionClass;
        }
        new (): Waterline;
    }
    interface CollectionClass {
        (): Collection
    }
    export interface CollectionDefinitions {
        attributes?: { [index: string]: Attribute };
        connection?: string;
        identity?: string;
        tableName?: string;
        migrate?: "alter" | "drop" | "safe";
        autoPK?: boolean;
        autoCreatedAt?: boolean;
        autoUpdatedAt?: boolean;
    }
    export type Attributes = { [index: string]: Attribute };
    export type Attribute = string | StringAttribute | IntegerAttribute | ModelAttribute | DatetimeAttribute | CollectionAttribute;
    export type BaseAttribute = {
        type?: string;
        autoIncrement?: boolean;
        primaryKey?: boolean;
        unique?: boolean;
        required?: boolean;
    }
    export type CollectionAttribute = BaseAttribute & {
        collection: string;
        via: string;
    }
    export type StringAttribute = BaseAttribute & {
        type: 'string';
        default?: string;
    }
    export type IntegerAttribute = BaseAttribute & {
        type: 'integer';
        default?: number;
    }
    export type ModelAttribute = BaseAttribute & {
        model: string;
    }
    export type DatetimeAttribute = BaseAttribute & {
        type: 'datetime';
        default?: Date;
    }
    export interface Collection extends CollectionDefinitions {
        create: (model: any) => Promise<any>;
        update: (conditions: any, model: any) => Promise<Array<any>>;
        find: (model: any) => Promise<Array<any>>;
        connections
        waterline: Waterline;
        adapter
        defaults
        hasSchema
        migrate
        adapterDictionary
        pkFormat
        syncable
        registerConnection
        teardown
        define
        findOne
        findOneById
        findOneByIdIn
        findOneByIdLike
        findById
        findByIdIn
        findByIdLike
        countById
        countByIdIn
        countByIdLike
        idStartsWith
        idContains
        idEndsWith
        findOneByCreatedAt
        findOneByCreatedAtIn
        findOneByCreatedAtLike
        findByCreatedAt
        findByCreatedAtIn
        findByCreatedAtLike
        countByCreatedAt
        countByCreatedAtIn
        countByCreatedAtLike
        createdAtStartsWith
        createdAtContains
        createdAtEndsWith
        findOneByUpdatedAt
        findOneByUpdatedAtIn
        findOneByUpdatedAtLike
        findByUpdatedAt
        findByUpdatedAtIn
        findByUpdatedAtLike
        countByUpdatedAt
        countByUpdatedAtIn
        countByUpdatedAtLike
        updatedAtStartsWith
        updatedAtContains
        updatedAtEndsWith
        definition
        meta
    }

}
declare module 'waterline' {
    var waterline: Waterline.WaterlineStatic;
    export = waterline;
}