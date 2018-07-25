export namespace AschCore
{
	//declarations/Block.d.ts
	/// <reference types="node" />
	export interface BlockHeader extends Entity {
	    height: number;
	    id?: string;
	    timestamp?: number;
	    payloadLength?: number;
	    payloadHash?: string;
	    prevBlockId?: string;
	    pointId?: string;
	    pointHeight?: number;
	    delegate?: string;
	    signature?: string;
	    count?: number;
	}
	export type BigNumber = number;
	export interface Transaction extends Entity {
	    id: string;
	    blockId: string;
	    type: number;
	    timestamp: number;
	    senderPublicKey: Buffer;
	    senderId: string;
	    recipientId: string;
	    amount: BigNumber;
	    fee: BigNumber;
	    signature?: Buffer;
	    signSignature?: Buffer;
	    signatures?: string;
	    args?: string;
	    message?: string;
	}
	export interface Block extends BlockHeader {
	    transactions?: Transaction[];
	}

	//declarations/BlockCache.d.ts
	export class BlockCache {
	    constructor(maxCachedCount: number);
	    isCached(height: number): boolean;
	    readonly cachedHeightRange: {
	        min: number;
	        max: number;
	    };
	    push(block: Block): void;
	    get(height: number): MaybeUndefined<Block>;
	    getById(id: string): MaybeUndefined<Block>;
	    evitUntil(minEvitHeight: number): void;
	}

	//declarations/Common.d.ts
	export type MaybeUndefined<T> = T | undefined;
	export type Nullable<T> = T | null | undefined;
	export interface ObjectLiteral {
	    [key: string]: any;
	}
	export type JsonObject = ObjectLiteral;
	export type Entity = ObjectLiteral;
	export type Property<E> = keyof E & string;
	export type Partial<T> = {
	    [P in keyof T]?: T[P];
	};
	export type ReadonlyPartial<T> = {
	    readonly [P in keyof T]: T[P];
	};
	export type Minix<T1, T2> = T1 & T2;
	export type FilterFunction<T> = (e: T) => boolean;
	export type Callback<TResult> = (err: Nullable<Error>, data: TResult) => void;
	export function makeJsonObject<T>(iterable: Iterable<T>, getKey: (t: T) => string, getValue: (t: T) => any): JsonObject;
	export function deepCopy<T>(src: T): T;
	export function partialCopy<T extends object>(src: T, keysOrKeyFilter: string[] | ((key: string) => boolean), dest?: Partial<T>): Partial<T>;
	export function isPrimitiveKey(key: any): boolean;
	export class NotImplementError extends Error {
	    constructor(message?: string);
	}
	export class CodeContractError extends Error {
	    constructor(message: string);
	}
	export type ContractCondition = boolean | (() => boolean);
	export type ContractMessage = string | (() => string);
	export type ContractVerifyResult = {
	    result: boolean;
	    message: Nullable<string>;
	};
	export type VerifyFunction = () => ContractVerifyResult;
	export class CodeContract {
	    static verify(condition: ContractCondition, message: ContractMessage): void;
	    static argument(argName: string, verify: VerifyFunction | ContractCondition, message?: ContractMessage): void;
	    static notNull(arg: any): ContractVerifyResult;
	    static notNullOrEmpty(str: Nullable<string>): ContractVerifyResult;
	    static notNullOrWhitespace(str: Nullable<string>): ContractVerifyResult;
	}

	//declarations/DbSession.d.ts
	export interface DbSessionOptions {
	    name?: string;
	    maxHistoryVersionsHold?: number;
	    cacheOptions?: LRUEntityCacheOptions;
	}
	export class DbSession {
	    constructor(connection: DbConnection, onLoadHistory: Nullable<LoadChangesHistoryAction>, sessionOptions: DbSessionOptions);
	    readonly isOpen: boolean;
	    readonly entityCache: EntityCache;
	    syncSchema<E extends object>(schema: ModelSchema<E>): void;
	    registerSchema(...schemas: ModelSchema<Entity>[]): void;
	    close(): Promise<void>;
	    getAll<E extends object>(schema: ModelSchema<E>, filter?: FilterFunction<E>): E[];
	    loadAll<E extends object>(schema: ModelSchema<E>): E[];
	    getMany<E extends object>(schema: ModelSchema<E>, condition: SqlCondition, cache?: boolean): Promise<E[]>;
	    query<E extends object>(schema: ModelSchema<E>, condition: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, fields?: string[], join?: JsonObject): Promise<E[]>;
	    queryByJson<E extends object>(schema: ModelSchema<E>, params: JsonObject): Promise<E[]>;
	    exists<E extends object>(schema: ModelSchema<E>, condition: SqlCondition): Promise<boolean>;
	    count<E extends object>(schema: ModelSchema<E>, condition: SqlCondition): Promise<number>;
	    create<E extends object>(schema: ModelSchema<E>, entity: Partial<E>): E;
	    load<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): Promise<MaybeUndefined<E>>;
	    loadSync<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): MaybeUndefined<E>;
	    getChanges(): ChangesHistoryItem<Entity>[];
	    getTrackingOrCachedEntity<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): MaybeUndefined<E>;
	    lockInThisSession(lockName: string, notThrow?: boolean): boolean;
	    /**
	     * Save changes to database
	     * @returns serial number for saveChanges
	     */
	    saveChanges(serial?: number): Promise<number>;
	    /**
	     * Rollback saved changes
	     * @param changesNO ,this value should be returned by @see saveChanges()
	     */
	    rollbackChanges(serial: number): Promise<number>;
	    update<E extends object>(schema: ModelSchema<E>, key: NormalizedEntityKey<E>, modifier: Partial<E>): void;
	    increase<E extends object>(schema: ModelSchema<E>, key: NormalizedEntityKey<E>, increasements: Partial<E>): Partial<E>;
	    delete<E extends object>(schema: ModelSchema<E>, key: NormalizedEntityKey<E>): void;
	    beginTransaction(): Promise<DBTransaction>;
	    beginEntityTransaction(): void;
	    commitEntityTransaction(): void;
	    rollbackEntityTransaction(): void;
	}

	//declarations/LevelBlock.d.ts
	export class LevelBlock {
	    constructor(dir: string, levelOptions?: {});
	    open(): Promise<void>;
	    close(): Promise<void>;
	    readonly lastBlockHeight: number;
	    appendBlock(block: BlockHeader, changes: ChangesHistoryItem<Entity>[]): Promise<void>;
	    getBlock(height: number): Promise<MaybeUndefined<BlockHeader>>;
	    getHistoryChanges(minHeight: number, maxHeight: number): Promise<Map<number, Array<ChangesHistoryItem<Entity>>>>;
	    deleteLastBlock(height: number): Promise<void>;
	    getBlockById(blockId: string): Promise<MaybeUndefined<BlockHeader>>;
	    getBlocksByHeightRange(minHeight: number, maxHeight: number): Promise<BlockHeader[]>;
	    getBlocksByIds(blockIds: string[]): Promise<BlockHeader[]>;
	}

	//declarations/Log.d.ts
	export enum LogLevel {
	    All = 127,
	    Trace = 64,
	    Debug = 32,
	    Log = 16,
	    Info = 8,
	    Warn = 4,
	    Error = 2,
	    Fatal = 1,
	    None = 0,
	}
	export interface Logger {
	    logLevel: LogLevel;
	    readonly infoEnabled: boolean;
	    readonly traceEnabled: boolean;
	    readonly logEnabled: boolean;
	    readonly debugEnabled: boolean;
	    readonly warnEnabled: boolean;
	    readonly errorEnaled: boolean;
	    readonly fatalEnabled: boolean;
	    trace(msg: string, ...params: any[]): void;
	    debug(msg: string, ...params: any[]): void;
	    log(msg: string, ...params: any[]): void;
	    info(msg: string, ...params: any[]): void;
	    warn(msg: string, ...params: any[]): void;
	    error(msg: string, err: Error): void;
	    fatal(msg: string, err: Error): void;
	}
	export interface LogFactory {
	    createLog: (name: string) => Logger;
	    getLevel: () => LogLevel;
	    format: boolean;
	}
	export class LogManager {
	    static defaultLevel: LogLevel;
	    static logFactory: LogFactory;
	    static getLogger(loggerName?: string): Logger;
	}

	//declarations/Model.d.ts
	export type Constructor<T> = {
	    new (): T;
	};
	export type ModelNameOrType<E> = string | Constructor<E>;
	export type SimpleKey = string | number;
	export type UniqueKey<E> = Partial<E>;
	export type CompositeKey<E> = UniqueKey<E>;
	export type PrimaryKey<E> = SimpleKey | CompositeKey<E>;
	export type EntityKey<E> = PrimaryKey<E> | UniqueKey<E> | NormalizedEntityKey<E>;
	export type NormalizedEntityKey<E> = UniqueKey<E>;
	export type ResolvedEntityKey<E> = {
	    isPrimaryKey?: boolean;
	    isUniqueKey?: boolean;
	    uniqueName: string;
	    key: NormalizedEntityKey<E>;
	};
	export type EntityUnique<E> = {
	    primaryKey?: UniqueKey<E>;
	    uniqueKey?: UniqueKey<E>;
	};
	export type DbRecord = JsonObject;
	export enum FieldTypes {
	    String = "String",
	    Number = "Number",
	    BigInt = "BigInt",
	    Text = "Text",
	    JSON = "Json",
	}
	export type FieldType = string | FieldTypes;
	export type ModelIndex<E> = {
	    name: string;
	    properties: Property<E>[];
	};
	export type DbIndex = {
	    name: string;
	    fields: string[];
	};
	export interface Field {
	    name: string;
	    type: FieldType;
	    length?: number;
	    index?: boolean | string;
	    unique?: boolean | string;
	    not_null?: boolean;
	    primary_key?: boolean;
	    composite_key?: boolean;
	    default?: number | string | null;
	}
	export interface ForeignKey {
	    field: string;
	    table: string;
	    table_field: string;
	}
	export interface Schema {
	    table?: string;
	    memory?: boolean;
	    readonly?: boolean;
	    local?: boolean;
	    tableFields: Field[];
	    foreignKeys?: ForeignKey[];
	}
	export class InvalidEntityKeyError extends Error {
	    constructor(modelName: string, key: EntityKey<Entity>);
	}
	export class ModelSchema<E extends object> {
	    constructor(schema: Schema, name: string);
	    readonly properties: Property<E>[];
	    readonly jsonProperties: Property<E>[];
	    readonly schemaObject: Schema;
	    readonly isCompsiteKey: boolean;
	    readonly primaryKey: MaybeUndefined<Property<E>>;
	    readonly compositeKeys: Property<E>[];
	    readonly indexes: ModelIndex<E>[];
	    readonly uniqueIndexes: ModelIndex<E>[];
	    readonly modelName: string;
	    readonly isLocal: boolean;
	    readonly isReadonly: boolean;
	    readonly memCached: boolean;
	    isValidProperty(name: string): boolean;
	    isValidEntityKey(key: EntityKey<E>): boolean;
	    setPrimaryKey(entity: Partial<E>, key: PrimaryKey<E>): Partial<E>;
	    getPrimaryKey(entity: Partial<E>): PrimaryKey<E>;
	    getNormalizedPrimaryKey(entity: Partial<E>): NormalizedEntityKey<E>;
	    normalizePrimaryKey(key: PrimaryKey<E>): NormalizedEntityKey<E>;
	    isValidPrimaryKey(key: PrimaryKey<E>): boolean;
	    isValidUniqueKey(key: UniqueKey<E>): boolean;
	    isPrimaryKeyUniqueName(indexName: string): boolean;
	    getUniqueIndex(indexName: string): MaybeUndefined<ModelIndex<E>>;
	    resolveKey(key: EntityKey<E>): MaybeUndefined<ResolvedEntityKey<E>>;
	    copyProperties(entity: Partial<E>, includePrimaryKey?: boolean): Partial<E>;
	    setDefaultValues(entity: E): void;
	    splitEntityAndVersion(entityWithVersion: Versioned<E>): {
	        version: number;
	        entity: E;
	    };
	}

	//declarations/SmartDB.d.ts
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	export type CommitBlockHook = (block: Block) => void;
	export type RollbackBlockHook = (fromHeight: number, toHeight: number) => void;
	export type SmartDBOptions = {
	    /**
	     * cached history count(block count), used to rollback block
	     * @default 10
	     */
	    maxBlockHistoryHold?: number;
	    /**
	     * clean persisted history automatically
	     * @default false
	     */
	    autoCleanPersistedHistory?: boolean;
	    /**
	     * cached last block count
	     * @default 10
	     */
	    cachedBlockCount?: number;
	    /**
	     * max cached entity count, config it per model, LRU
	     * sample: { User: 200, Trans: 5000 } max cached 200s User ，5000 for Trans
	     * @default 50000 each model
	     */
	    entityCacheOptions?: LRUEntityCacheOptions;
	    /**
	     * SmartDB will check modifier properties in model if checkModifier is true
	     */
	    checkModifier?: boolean;
	};
	/**
	 * ORM like to operate blockchain data
	 * @event ready emmit after initialized
	 * @event close emmit after closed
	 */
	export class SmartDB extends EventEmitter {
	    /**
	     * Constructor
	     * NOTIC : you need call init before use SmartDB
	     * @param dbPath path of blockchain db
	     * @param levelBlockDir path of block header db
	     * @param options of SmartDB
	     */
	    constructor(dbPath: string, levelBlockDir: string, options?: SmartDBOptions);
	    /**
	     * register commit block hook, which will be called before commit block
	     * @param name hook name
	     * @param hookFunc hook function , ( block ) => void
	     */
	    registerCommitBlockHook(name: string, hookFunc: CommitBlockHook): void;
	    /**
	     * unregister commit block hook
	     * @param name hook name
	     */
	    unregisterCommitBlockHook(name: string): void;
	    /**
	     * register rollback block hook, which will be called before commit block
	     * @param name hook name
	     * @param hookFunc hook function , ( fromHeight, toHeight ) => void
	     */
	    registerRollbackBlockHook(name: string, hookFunc: RollbackBlockHook): void;
	    /**
	     * unregister rollback block hook
	     * @param name hook name
	     */
	    unregisterRollbackBlockHook(name: string): void;
	    /**
	     * initialize SmartDB , you need call this before use SmartDB
	     * @param schemas table schemas in Database
	     */
	    init(schemas: ModelSchema<Entity>[]): Promise<void>;
	    /**
	     * free resources
	     */
	    close(): Promise<void>;
	    /**
	     * height of last block
	     */
	    readonly lastBlockHeight: number;
	    /**
	     * blocks count
	     */
	    readonly blocksCount: number;
	    /**
	     * last commited block
	     */
	    readonly lastBlock: MaybeUndefined<Block>;
	    /**
	     * hold a lock name which only succeed in first time of each block.
	     * @param lockName lock name
	     * @param notThrow do not throw exception if lock failed
	     */
	    lockInCurrentBlock(lockName: string, notThrow?: boolean): boolean;
	    /**
	     * begin a contract transaction which effect entities in memory
	     */
	    beginContract(): void;
	    /**
	     * commit contract transaction which effect entities in memory
	     */
	    commitContract(): void;
	    /**
	     * rollback contract transaction which effect entities in memory
	     */
	    rollbackContract(): void;
	    /**
	     * begin a new block
	     * @param blockHeader
	     */
	    beginBlock(block: Block): void;
	    /**
	     * commit block changes
	     */
	    commitBlock(): Promise<number>;
	    /**
	     * rollback block changes
	     * @param height rollback to height(excluded)
	     */
	    rollbackBlock(height?: number): Promise<void>;
	    /**
	     * save changes of local tables (not in block --- which define in schema by local : true) into database
	     * @returns serial number for changes
	     */
	    saveLocalChanges(): Promise<number>;
	    /**
	     * rollback local tables changes saveLocalChanges
	     * @param serial serial number return from saveLocalChanges
	     */
	    rollbackLocalChanges(serial: number): Promise<void>;
	    /**
	     * create a new entity which change will be tracked and persistented (by saveChanges) automatically
	     * @param model modelName or model type
	     * @param entity prototype entity which properties will copy to result entity
	     * @returns tracking entity
	     */
	    create<E extends object>(model: ModelNameOrType<E>, entity: Partial<E>): E;
	    createOrLoad<E extends object>(model: ModelNameOrType<E>, entity: E): {
	        create: boolean;
	        entity: E;
	    };
	    increase<E extends object>(model: ModelNameOrType<E>, increasements: Partial<E>, key: NormalizedEntityKey<E>): Partial<E>;
	    /**
	     * update a entity
	     * @param model modelName or model type
	     * @param keyOrEntity primary key of entity or parital entity with primary key property(s)
	     * @param modifier json modifier, keyOrEntity properties used as modifier if not given
	     */
	    update<E extends object>(model: ModelNameOrType<E>, modifier: Partial<E>, key: NormalizedEntityKey<E>): void;
	    /**
	     * delete a entity
	     * @param model modelName or model type
	     * @param key primaryKey of entity
	     */
	    del<E extends object>(model: ModelNameOrType<E>, key: NormalizedEntityKey<E>): void;
	    /**
	     * load entity from cache and database
	     * @param model model name or model type
	     * @param key key of entity
	     */
	    load<E extends object>(model: ModelNameOrType<E>, key: EntityKey<E>): Promise<MaybeUndefined<E>>;
	    loadSync<E extends object>(model: ModelNameOrType<E>, key: EntityKey<E>): MaybeUndefined<E>;
	    /**
	   * get entities from database
	   * @param model model name or model type
	   * @param condition find condition, see type SqlCondition
	   * @param cache track and cache result if true
	   */
	    loadMany<E extends object>(model: ModelNameOrType<E>, condition: SqlCondition, cache?: boolean): Promise<E[]>;
	    /**
	     * load entity from cache only
	     * @param model model name or model type
	     * @param key key of entity
	     * @returns tracked entity from cache
	     */
	    get<E extends object>(model: ModelNameOrType<E>, key: EntityKey<E>): MaybeUndefined<E>;
	    /**
	     * get all cached entities
	     * @param model model name or model type
	     * @param filter filter result
	     */
	    getAll<E extends object>(model: ModelNameOrType<E>, filter?: FilterFunction<E>): E[];
	    /**
	     * find entities from database
	     * @param model model name or model type
	     * @param condition query condition, see type SqlCondition
	     * @param resultRange limit and offset of results number or json, eg: 10 or { limit : 10, offset : 1 }
	     * @param sort json { propertyName : 'ASC' | 'DESC' } , eg: { name : 'ASC', age : 'DESC' }
	     * @param properties result properties, default is all properties of model
	     * @param offset offset of result set
	     * @param join join info
	     */
	    find<E extends object>(model: ModelNameOrType<E>, condition: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, properties?: string[], join?: JsonObject): Promise<Entity[]>;
	    /**
	     * find entities from database
	     * @param model model name or model type
	     * @param params mango like query params object
	     */
	    findOne<E extends object>(model: ModelNameOrType<E>, params: JsonObject): Promise<MaybeUndefined<E>>;
	    /**
	   * find entities from database
	   * @param model model name or model type
	   * @param params mango like query params object
	   */
	    findAll<E extends object>(model: ModelNameOrType<E>, params: JsonObject): Promise<E[]>;
	    /**
	     * query if exists entity by specified condition
	     * @param model model name or model type
	     * @param condition query condition, see type SqlCondition
	     */
	    exists<E extends object>(model: ModelNameOrType<E>, condition: SqlCondition): Promise<boolean>;
	    /**
	     * count entities count by specified condition
	     * @param model model name or model type
	     * @param condition query condition, see type SqlCondition
	     */
	    count<E extends object>(model: ModelNameOrType<E>, condition: SqlCondition): Promise<number>;
	    /**
	    * get block header by height
	    * @param height block height
	    * @param withTransactions result contains transactions, defualt is false
	    * @returns block which height === given height
	    */
	    getBlockByHeight(height: number, withTransactions?: boolean): Promise<MaybeUndefined<Block>>;
	    /**
	     * get block header by block id
	     * @param blockId block id
	     * @param withTransactions result contains transactions, defualt is false
	     * @returns block which id === given blockId
	     */
	    getBlockById(blockId: string, withTransactions?: boolean): Promise<MaybeUndefined<Block>>;
	    /**
	     * get block headers by height range
	     * @param minHeight min height(included)
	     * @param maxHeight max height(included)
	     * @returns blocks which maxHeight >= height <= minHeight
	     */
	    getBlocksByHeightRange(minHeight: number, maxHeight: number, withTransactions?: boolean): Promise<Block[]>;
	    /**
	     * get block headers by block id array
	     * @param blockIds array of block id
	     */
	    getBlocksByIds(blockIds: string[], withTransactions?: boolean): Promise<Block[]>;
	}

	//declarations/Utils.d.ts
	import * as _ from 'lodash';
	export class PerformanceHelper {
	    readonly time: (name: string) => void;
	    readonly endTime: (refreshUptime?: boolean) => void;
	    readonly restartTime: (name: string) => void;
	    enabled: boolean;
	}
	export class Utils {
	    static readonly Array: {
	        chunk: <T>(array: ArrayLike<T> | null | undefined, size?: number | undefined) => T[][];
	        compact: <T>(array: ArrayLike<false | "" | 0 | T | null | undefined> | null | undefined) => T[];
	        concat: <T>(array: _.Many<T>, ...values: _.Many<T>[]) => T[];
	        difference: <T>(array: ArrayLike<T> | null | undefined, ...values: ArrayLike<T>[]) => T[];
	        differenceBy: {
	            <T1, T2>(array: ArrayLike<T1> | null | undefined, values: ArrayLike<T2>, iteratee: _.ValueIteratee<T1 | T2>): T1[];
	            <T1, T2, T3>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, iteratee: _.ValueIteratee<T1 | T2 | T3>): T1[];
	            <T1, T2, T3, T4>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, values3: ArrayLike<T4>, iteratee: _.ValueIteratee<T1 | T2 | T3 | T4>): T1[];
	            <T1, T2, T3, T4, T5>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, values3: ArrayLike<T4>, values4: ArrayLike<T5>, iteratee: _.ValueIteratee<T1 | T2 | T3 | T4 | T5>): T1[];
	            <T1, T2, T3, T4, T5, T6>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, values3: ArrayLike<T4>, values4: ArrayLike<T5>, values5: ArrayLike<T6>, iteratee: _.ValueIteratee<T1 | T2 | T3 | T4 | T5 | T6>): T1[];
	            <T1, T2, T3, T4, T5, T6, T7>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, values3: ArrayLike<T4>, values4: ArrayLike<T5>, values5: ArrayLike<T6>, ...values: (string | [string, any] | ArrayLike<T7> | ((value: T1 | T2 | T3 | T4 | T5 | T6 | T7) => _.NotVoid) | _.PartialDeep<T1> | _.PartialDeep<T2> | _.PartialDeep<T3> | _.PartialDeep<T4> | _.PartialDeep<T5> | _.PartialDeep<T6> | _.PartialDeep<T7>)[]): T1[];
	            <T>(array: ArrayLike<T> | null | undefined, ...values: ArrayLike<T>[]): T[];
	        };
	        differenceWith: {
	            <T1, T2>(array: ArrayLike<T1> | null | undefined, values: ArrayLike<T2>, comparator: _.Comparator2<T1, T2>): T1[];
	            <T1, T2, T3>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, comparator: _.Comparator2<T1, T2 | T3>): T1[];
	            <T1, T2, T3, T4>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, ...values: (ArrayLike<T4> | _.Comparator2<T1, T2 | T3 | T4>)[]): T1[];
	            <T>(array: ArrayLike<T> | null | undefined, ...values: ArrayLike<T>[]): T[];
	        };
	        drop: <T>(array: ArrayLike<T> | null | undefined, n?: number | undefined) => T[];
	        dropRight: <T>(array: ArrayLike<T> | null | undefined, n?: number | undefined) => T[];
	        dropRightWhile: <T>(array: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, _.NotVoid> | _.PartialDeep<T> | undefined) => T[];
	        dropWhile: <T>(array: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, _.NotVoid> | _.PartialDeep<T> | undefined) => T[];
	        fill: {
	            <T>(array: any[] | null | undefined, value: T): T[];
	            <T>(array: ArrayLike<any> | null | undefined, value: T): ArrayLike<T>;
	            <T, U>(array: U[] | null | undefined, value: T, start?: number | undefined, end?: number | undefined): (T | U)[];
	            <T, U>(array: ArrayLike<U> | null | undefined, value: T, start?: number | undefined, end?: number | undefined): ArrayLike<T | U>;
	        };
	        findIndex: <T>(array: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, boolean> | _.PartialDeep<T> | undefined, fromIndex?: number | undefined) => number;
	        findLastIndex: <T>(array: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, boolean> | _.PartialDeep<T> | undefined, fromIndex?: number | undefined) => number;
	        first: <T>(array: ArrayLike<T> | null | undefined) => T | undefined;
	        head: <T>(array: ArrayLike<T> | null | undefined) => T | undefined;
	        flatten: <T>(array: ArrayLike<_.Many<T>> | null | undefined) => T[];
	        flattenDeep: <T>(array: _.ListOfRecursiveArraysOrValues<T> | null | undefined) => T[];
	        flattenDepth: <T>(array: _.ListOfRecursiveArraysOrValues<T> | null | undefined, depth?: number | undefined) => T[];
	        fromPairs: {
	            <T>(pairs: ArrayLike<[PropertyKey, T]> | null | undefined): _.Dictionary<T>;
	            (pairs: ArrayLike<any[]> | null | undefined): _.Dictionary<any>;
	        };
	        indexOf: <T>(array: ArrayLike<T> | null | undefined, value: T, fromIndex?: number | undefined) => number;
	        initial: <T>(array: ArrayLike<T> | null | undefined) => T[];
	        intersection: <T>(...arrays: ArrayLike<T>[]) => T[];
	        intersectionBy: {
	            <T1, T2>(array: ArrayLike<T1> | null, values: ArrayLike<T2>, iteratee: _.ValueIteratee<T1 | T2>): T1[];
	            <T1, T2, T3>(array: ArrayLike<T1> | null, values1: ArrayLike<T2>, values2: ArrayLike<T3>, iteratee: _.ValueIteratee<T1 | T2 | T3>): T1[];
	            <T1, T2, T3, T4>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, ...values: (string | [string, any] | ArrayLike<T4> | ((value: T1 | T2 | T3 | T4) => _.NotVoid) | _.PartialDeep<T1> | _.PartialDeep<T2> | _.PartialDeep<T3> | _.PartialDeep<T4>)[]): T1[];
	            <T>(array?: ArrayLike<T> | null | undefined, ...values: ArrayLike<T>[]): T[];
	        };
	        intersectionWith: {
	            <T1, T2>(array: ArrayLike<T1> | null | undefined, values: ArrayLike<T2>, comparator: _.Comparator2<T1, T2>): T1[];
	            <T1, T2, T3>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, comparator: _.Comparator2<T1, T2 | T3>): T1[];
	            <T1, T2, T3, T4>(array: ArrayLike<T1> | null | undefined, values1: ArrayLike<T2>, values2: ArrayLike<T3>, ...values: (ArrayLike<T4> | _.Comparator2<T1, T2 | T3 | T4>)[]): T1[];
	            <T>(array?: ArrayLike<T> | null | undefined, ...values: ArrayLike<T>[]): T[];
	        };
	        join: (array: ArrayLike<any> | null | undefined, separator?: string | undefined) => string;
	        last: <T>(array: ArrayLike<T> | null | undefined) => T | undefined;
	        lastIndexOf: <T>(array: ArrayLike<T> | null | undefined, value: T, fromIndex?: number | true | undefined) => number;
	        nth: <T>(array: ArrayLike<T> | null | undefined, n?: number | undefined) => T | undefined;
	        pull: {
	            <T>(array: T[], ...values: T[]): T[];
	            <T>(array: ArrayLike<T>, ...values: T[]): ArrayLike<T>;
	        };
	        pullAll: {
	            <T>(array: T[], values?: ArrayLike<T> | undefined): T[];
	            <T>(array: ArrayLike<T>, values?: ArrayLike<T> | undefined): ArrayLike<T>;
	        };
	        pullAllBy: {
	            <T>(array: T[], values?: ArrayLike<T> | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): T[];
	            <T>(array: ArrayLike<T>, values?: ArrayLike<T> | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): ArrayLike<T>;
	            <T1, T2>(array: T1[], values: ArrayLike<T2>, iteratee: _.ValueIteratee<T1 | T2>): T1[];
	            <T1, T2>(array: ArrayLike<T1>, values: ArrayLike<T2>, iteratee: _.ValueIteratee<T1 | T2>): ArrayLike<T1>;
	        };
	        pullAllWith: {
	            <T>(array: T[], values?: ArrayLike<T> | undefined, comparator?: _.Comparator<T> | undefined): T[];
	            <T>(array: ArrayLike<T>, values?: ArrayLike<T> | undefined, comparator?: _.Comparator<T> | undefined): ArrayLike<T>;
	            <T1, T2>(array: T1[], values: ArrayLike<T2>, comparator: _.Comparator2<T1, T2>): T1[];
	            <T1, T2>(array: ArrayLike<T1>, values: ArrayLike<T2>, comparator: _.Comparator2<T1, T2>): ArrayLike<T1>;
	        };
	        pullAt: {
	            <T>(array: T[], ...indexes: _.Many<number>[]): T[];
	            <T>(array: ArrayLike<T>, ...indexes: _.Many<number>[]): ArrayLike<T>;
	        };
	        remove: <T>(array: ArrayLike<T>, predicate?: string | [string, any] | _.ListIterator<T, _.NotVoid> | _.PartialDeep<T> | undefined) => T[];
	        reverse: <TList extends ArrayLike<any>>(array: TList) => TList;
	        slice: <T>(array: ArrayLike<T> | null | undefined, start?: number | undefined, end?: number | undefined) => T[];
	        sortedIndex: {
	            <T>(array: ArrayLike<T> | null | undefined, value: T): number;
	            <T>(array: ArrayLike<T> | null | undefined, value: T): number;
	        };
	        sortedIndexBy: <T>(array: ArrayLike<T> | null | undefined, value: T, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined) => number;
	        sortedIndexOf: <T>(array: ArrayLike<T> | null | undefined, value: T) => number;
	        sortedLastIndex: <T>(array: ArrayLike<T> | null | undefined, value: T) => number;
	        sortedLastIndexBy: <T>(array: ArrayLike<T> | null | undefined, value: T, iteratee: _.ValueIteratee<T>) => number;
	        sortedLastIndexOf: <T>(array: ArrayLike<T> | null | undefined, value: T) => number;
	        sortedUniq: <T>(array: ArrayLike<T> | null | undefined) => T[];
	        sortedUniqBy: <T>(array: ArrayLike<T> | null | undefined, iteratee: _.ValueIteratee<T>) => T[];
	        tail: <T>(array: ArrayLike<T> | null | undefined) => T[];
	        take: <T>(array: ArrayLike<T> | null | undefined, n?: number | undefined) => T[];
	        takeRight: <T>(array: ArrayLike<T> | null | undefined, n?: number | undefined) => T[];
	        takeRightWhile: <T>(array: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, _.NotVoid> | _.PartialDeep<T> | undefined) => T[];
	        takeWhile: <T>(array: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, _.NotVoid> | _.PartialDeep<T> | undefined) => T[];
	        union: <T>(...arrays: (ArrayLike<T> | null | undefined)[]) => T[];
	        unionBy: {
	            <T>(arrays: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): T[];
	            <T>(arrays1: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): T[];
	            <T>(arrays1: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, arrays3: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): T[];
	            <T>(arrays1: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, arrays3: ArrayLike<T> | null | undefined, arrays4: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): T[];
	            <T>(arrays1: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, arrays3: ArrayLike<T> | null | undefined, arrays4: ArrayLike<T> | null | undefined, arrays5: ArrayLike<T> | null | undefined, ...iteratee: (string | [string, any] | ArrayLike<T> | ((value: T) => _.NotVoid) | _.PartialDeep<T> | null | undefined)[]): T[];
	        };
	        unionWith: {
	            <T>(arrays: ArrayLike<T> | null | undefined, comparator?: _.Comparator<T> | undefined): T[];
	            <T>(arrays: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, comparator?: _.Comparator<T> | undefined): T[];
	            <T>(arrays: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, arrays3: ArrayLike<T> | null | undefined, ...comparator: (ArrayLike<T> | _.Comparator<T> | null | undefined)[]): T[];
	        };
	        uniq: <T>(array: ArrayLike<T> | null | undefined) => T[];
	        uniqBy: <T>(array: ArrayLike<T> | null | undefined, iteratee: _.ValueIteratee<T>) => T[];
	        uniqWith: <T>(array: ArrayLike<T> | null | undefined, comparator?: _.Comparator<T> | undefined) => T[];
	        unzip: <T>(array: T[][] | ArrayLike<ArrayLike<T>> | null | undefined) => T[][];
	        unzipWith: {
	            <T, TResult>(array: ArrayLike<ArrayLike<T>> | null | undefined, iteratee: (...values: T[]) => TResult): TResult[];
	            <T>(array: ArrayLike<ArrayLike<T>> | null | undefined): T[][];
	        };
	        without: <T>(array: ArrayLike<T> | null | undefined, ...values: T[]) => T[];
	        xor: <T>(...arrays: (ArrayLike<T> | null | undefined)[]) => T[];
	        xorBy: {
	            <T>(arrays: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): T[];
	            <T>(arrays: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): T[];
	            <T>(arrays: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, arrays3: ArrayLike<T> | null | undefined, ...iteratee: (string | [string, any] | ArrayLike<T> | ((value: T) => _.NotVoid) | _.PartialDeep<T> | null | undefined)[]): T[];
	        };
	        xorWith: {
	            <T>(arrays: ArrayLike<T> | null | undefined, comparator?: _.Comparator<T> | undefined): T[];
	            <T>(arrays: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, comparator?: _.Comparator<T> | undefined): T[];
	            <T>(arrays: ArrayLike<T> | null | undefined, arrays2: ArrayLike<T> | null | undefined, arrays3: ArrayLike<T> | null | undefined, ...comparator: (ArrayLike<T> | _.Comparator<T> | null | undefined)[]): T[];
	        };
	        zip: {
	            <T1, T2>(arrays1: ArrayLike<T1>, arrays2: ArrayLike<T2>): [T1 | undefined, T2 | undefined][];
	            <T1, T2, T3>(arrays1: ArrayLike<T1>, arrays2: ArrayLike<T2>, arrays3: ArrayLike<T3>): [T1 | undefined, T2 | undefined, T3 | undefined][];
	            <T1, T2, T3, T4>(arrays1: ArrayLike<T1>, arrays2: ArrayLike<T2>, arrays3: ArrayLike<T3>, arrays4: ArrayLike<T4>): [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined][];
	            <T1, T2, T3, T4, T5>(arrays1: ArrayLike<T1>, arrays2: ArrayLike<T2>, arrays3: ArrayLike<T3>, arrays4: ArrayLike<T4>, arrays5: ArrayLike<T5>): [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined, T5 | undefined][];
	            <T>(...arrays: (ArrayLike<T> | null | undefined)[]): (T | undefined)[][];
	        };
	        zipObject: {
	            <T>(props: ArrayLike<PropertyKey>, values: ArrayLike<T>): _.Dictionary<T>;
	            (props?: ArrayLike<PropertyKey> | undefined): _.Dictionary<undefined>;
	        };
	        zipObjectDeep: (paths?: ArrayLike<_.Many<PropertyKey>> | undefined, values?: ArrayLike<any> | undefined) => object;
	        zipWith: {
	            <T, TResult>(arrays: ArrayLike<T>, iteratee: (value1: T) => TResult): TResult[];
	            <T1, T2, TResult>(arrays1: ArrayLike<T1>, arrays2: ArrayLike<T2>, iteratee: (value1: T1, value2: T2) => TResult): TResult[];
	            <T1, T2, T3, TResult>(arrays1: ArrayLike<T1>, arrays2: ArrayLike<T2>, arrays3: ArrayLike<T3>, iteratee: (value1: T1, value2: T2, value3: T3) => TResult): TResult[];
	            <T1, T2, T3, T4, TResult>(arrays1: ArrayLike<T1>, arrays2: ArrayLike<T2>, arrays3: ArrayLike<T3>, arrays4: ArrayLike<T4>, iteratee: (value1: T1, value2: T2, value3: T3, value4: T4) => TResult): TResult[];
	            <T1, T2, T3, T4, T5, TResult>(arrays1: ArrayLike<T1>, arrays2: ArrayLike<T2>, arrays3: ArrayLike<T3>, arrays4: ArrayLike<T4>, arrays5: ArrayLike<T5>, iteratee: (value1: T1, value2: T2, value3: T3, value4: T4, value5: T5) => TResult): TResult[];
	            <T, TResult>(...iteratee: (((...group: T[]) => TResult) | ArrayLike<T> | null | undefined)[]): TResult[];
	        };
	    };
	    static readonly String: {
	        camelCase: (string?: string | undefined) => string;
	        capitalize: (string?: string | undefined) => string;
	        deburr: (string?: string | undefined) => string;
	        endsWith: (string?: string | undefined, target?: string | undefined, position?: number | undefined) => boolean;
	        escape: (string?: string | undefined) => string;
	        escapeRegExp: (string?: string | undefined) => string;
	        kebabCase: (string?: string | undefined) => string;
	        lowerCase: (string?: string | undefined) => string;
	        lowerFirst: (string?: string | undefined) => string;
	        pad: (string?: string | undefined, length?: number | undefined, chars?: string | undefined) => string;
	        padEnd: (string?: string | undefined, length?: number | undefined, chars?: string | undefined) => string;
	        padStart: (string?: string | undefined, length?: number | undefined, chars?: string | undefined) => string;
	        parseInt: (string: string, radix?: number | undefined) => number;
	        repeat: (string?: string | undefined, n?: number | undefined) => string;
	        replace: {
	            (string: string, pattern: string | RegExp, replacement: string | _.ReplaceFunction): string;
	            (pattern: string | RegExp, replacement: string | _.ReplaceFunction): string;
	        };
	        snakeCase: (string?: string | undefined) => string;
	        split: {
	            (string: string, separator?: string | RegExp | undefined, limit?: number | undefined): string[];
	            (string: string, index: string | number, guard: object): string[];
	        };
	        startCase: (string?: string | undefined) => string;
	        startsWith: (string?: string | undefined, target?: string | undefined, position?: number | undefined) => boolean;
	        template: (string?: string | undefined, options?: _.TemplateOptions | undefined) => _.TemplateExecutor;
	        toLower: (string?: string | undefined) => string;
	        toUpper: (string?: string | undefined) => string;
	        trim: {
	            (string?: string | undefined, chars?: string | undefined): string;
	            (string: string, index: string | number, guard: object): string;
	        };
	        trimEnd: {
	            (string?: string | undefined, chars?: string | undefined): string;
	            (string: string, index: string | number, guard: object): string;
	        };
	        trimStart: {
	            (string?: string | undefined, chars?: string | undefined): string;
	            (string: string, index: string | number, guard: object): string;
	        };
	        truncate: (string?: string | undefined, options?: _.TruncateOptions | undefined) => string;
	        unescape: (string?: string | undefined) => string;
	        upperCase: (string?: string | undefined) => string;
	        upperFirst: (string?: string | undefined) => string;
	        words: {
	            (string?: string | undefined, pattern?: string | RegExp | undefined): string[];
	            (string: string, index: string | number, guard: object): string[];
	        };
	    };
	    static readonly Collection: {
	        countBy: {
	            <T>(collection: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): _.Dictionary<number>;
	            <T extends object>(collection: T | null | undefined, iteratee?: string | [string, any] | ((value: T[keyof T]) => _.NotVoid) | _.PartialDeep<T[keyof T]> | undefined): _.Dictionary<number>;
	        };
	        each: {
	            <T>(collection: T[], iteratee?: _.ArrayIterator<T, any> | undefined): T[];
	            (collection: string, iteratee?: _.StringIterator<any> | undefined): string;
	            <T>(collection: ArrayLike<T>, iteratee?: _.ListIterator<T, any> | undefined): ArrayLike<T>;
	            <T extends object>(collection: T, iteratee?: _.ObjectIterator<T, any> | undefined): T;
	            <T, TArray extends T[] | null | undefined>(collection: (TArray & undefined) | (TArray & null) | (TArray & T[]), iteratee?: _.ArrayIterator<T, any> | undefined): TArray;
	            <TString extends string | null | undefined>(collection: TString, iteratee?: _.StringIterator<any> | undefined): TString;
	            <T, TList extends ArrayLike<T> | null | undefined>(collection: (TList & undefined) | (TList & null) | (TList & ArrayLike<T>), iteratee?: _.ListIterator<T, any> | undefined): TList;
	            <T extends object>(collection: T | null | undefined, iteratee?: _.ObjectIterator<T, any> | undefined): T | null | undefined;
	        };
	        eachRight: {
	            <T>(collection: T[], iteratee?: _.ArrayIterator<T, any> | undefined): T[];
	            (collection: string, iteratee?: _.StringIterator<any> | undefined): string;
	            <T>(collection: ArrayLike<T>, iteratee?: _.ListIterator<T, any> | undefined): ArrayLike<T>;
	            <T extends object>(collection: T, iteratee?: _.ObjectIterator<T, any> | undefined): T;
	            <T, TArray extends T[] | null | undefined>(collection: (TArray & undefined) | (TArray & null) | (TArray & T[]), iteratee?: _.ArrayIterator<T, any> | undefined): TArray;
	            <TString extends string | null | undefined>(collection: TString, iteratee?: _.StringIterator<any> | undefined): TString;
	            <T, TList extends ArrayLike<T> | null | undefined>(collection: (TList & undefined) | (TList & null) | (TList & ArrayLike<T>), iteratee?: _.ListIterator<T, any> | undefined): TList;
	            <T extends object>(collection: T | null | undefined, iteratee?: _.ObjectIterator<T, any> | undefined): T | null | undefined;
	        };
	        every: {
	            <T>(collection: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, boolean> | _.PartialDeep<T> | undefined): boolean;
	            <T extends object>(collection: T | null | undefined, predicate?: string | [string, any] | _.ObjectIterator<T, boolean> | _.PartialDeep<T[keyof T]> | undefined): boolean;
	        };
	        filter: {
	            (collection: string | null | undefined, predicate?: _.StringIterator<boolean> | undefined): string[];
	            <T, S extends T>(collection: ArrayLike<T> | null | undefined, predicate: _.ListIteratorTypeGuard<T, S>): S[];
	            <T>(collection: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, boolean> | _.PartialDeep<T> | undefined): T[];
	            <T extends object, S extends T[keyof T]>(collection: T | null | undefined, predicate: _.ObjectIteratorTypeGuard<T, S>): S[];
	            <T extends object>(collection: T | null | undefined, predicate?: string | [string, any] | _.ObjectIterator<T, boolean> | _.PartialDeep<T[keyof T]> | undefined): T[keyof T][];
	        };
	        find: {
	            <T, S extends T>(collection: ArrayLike<T> | null | undefined, predicate: _.ListIteratorTypeGuard<T, S>, fromIndex?: number | undefined): S | undefined;
	            <T>(collection: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, boolean> | _.PartialDeep<T> | undefined, fromIndex?: number | undefined): T | undefined;
	            <T extends object, S extends T[keyof T]>(collection: T | null | undefined, predicate: _.ObjectIteratorTypeGuard<T, S>, fromIndex?: number | undefined): S | undefined;
	            <T extends object>(collection: T | null | undefined, predicate?: string | [string, any] | _.ObjectIterator<T, boolean> | _.PartialDeep<T[keyof T]> | undefined, fromIndex?: number | undefined): T[keyof T] | undefined;
	        };
	        findLast: {
	            <T, S extends T>(collection: ArrayLike<T> | null | undefined, predicate: _.ListIteratorTypeGuard<T, S>, fromIndex?: number | undefined): S | undefined;
	            <T>(collection: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, boolean> | _.PartialDeep<T> | undefined, fromIndex?: number | undefined): T | undefined;
	            <T extends object, S extends T[keyof T]>(collection: T | null | undefined, predicate: _.ObjectIteratorTypeGuard<T, S>, fromIndex?: number | undefined): S | undefined;
	            <T extends object>(collection: T | null | undefined, predicate?: string | [string, any] | _.ObjectIterator<T, boolean> | _.PartialDeep<T[keyof T]> | undefined, fromIndex?: number | undefined): T[keyof T] | undefined;
	        };
	        flatMap: {
	            <T>(collection: ArrayLike<_.Many<T>> | _.Dictionary<_.Many<T>> | _.NumericDictionary<_.Many<T>> | null | undefined): T[];
	            (collection: object | null | undefined): any[];
	            <T, TResult>(collection: ArrayLike<T> | null | undefined, iteratee: _.ListIterator<T, _.Many<TResult>>): TResult[];
	            <T extends object, TResult>(collection: T | null | undefined, iteratee: _.ObjectIterator<T, _.Many<TResult>>): TResult[];
	            (collection: object | null | undefined, iteratee: string): any[];
	            (collection: object | null | undefined, iteratee: object): boolean[];
	        };
	        flatMapDeep: {
	            <T>(collection: ArrayLike<T | _.ListOfRecursiveArraysOrValues<T>> | _.Dictionary<T | _.ListOfRecursiveArraysOrValues<T>> | _.NumericDictionary<T | _.ListOfRecursiveArraysOrValues<T>> | null | undefined): T[];
	            <T, TResult>(collection: ArrayLike<T> | null | undefined, iteratee: _.ListIterator<T, TResult | _.ListOfRecursiveArraysOrValues<TResult>>): TResult[];
	            <T extends object, TResult>(collection: T | null | undefined, iteratee: _.ObjectIterator<T, TResult | _.ListOfRecursiveArraysOrValues<TResult>>): TResult[];
	            (collection: object | null | undefined, iteratee: string): any[];
	            (collection: object | null | undefined, iteratee: object): boolean[];
	        };
	        flatMapDepth: {
	            <T>(collection: ArrayLike<T | _.ListOfRecursiveArraysOrValues<T>> | _.Dictionary<T | _.ListOfRecursiveArraysOrValues<T>> | _.NumericDictionary<T | _.ListOfRecursiveArraysOrValues<T>> | null | undefined): T[];
	            <T, TResult>(collection: ArrayLike<T> | null | undefined, iteratee: _.ListIterator<T, TResult | _.ListOfRecursiveArraysOrValues<TResult>>, depth?: number | undefined): TResult[];
	            <T extends object, TResult>(collection: T | null | undefined, iteratee: _.ObjectIterator<T, TResult | _.ListOfRecursiveArraysOrValues<TResult>>, depth?: number | undefined): TResult[];
	            (collection: object | null | undefined, iteratee: string, depth?: number | undefined): any[];
	            (collection: object | null | undefined, iteratee: object, depth?: number | undefined): boolean[];
	        };
	        forEach: {
	            <T>(collection: T[], iteratee?: _.ArrayIterator<T, any> | undefined): T[];
	            (collection: string, iteratee?: _.StringIterator<any> | undefined): string;
	            <T>(collection: ArrayLike<T>, iteratee?: _.ListIterator<T, any> | undefined): ArrayLike<T>;
	            <T extends object>(collection: T, iteratee?: _.ObjectIterator<T, any> | undefined): T;
	            <T, TArray extends T[] | null | undefined>(collection: (TArray & undefined) | (TArray & null) | (TArray & T[]), iteratee?: _.ArrayIterator<T, any> | undefined): TArray;
	            <TString extends string | null | undefined>(collection: TString, iteratee?: _.StringIterator<any> | undefined): TString;
	            <T, TList extends ArrayLike<T> | null | undefined>(collection: (TList & undefined) | (TList & null) | (TList & ArrayLike<T>), iteratee?: _.ListIterator<T, any> | undefined): TList;
	            <T extends object>(collection: T | null | undefined, iteratee?: _.ObjectIterator<T, any> | undefined): T | null | undefined;
	        };
	        forEachRight: {
	            <T>(collection: T[], iteratee?: _.ArrayIterator<T, any> | undefined): T[];
	            (collection: string, iteratee?: _.StringIterator<any> | undefined): string;
	            <T>(collection: ArrayLike<T>, iteratee?: _.ListIterator<T, any> | undefined): ArrayLike<T>;
	            <T extends object>(collection: T, iteratee?: _.ObjectIterator<T, any> | undefined): T;
	            <T, TArray extends T[] | null | undefined>(collection: (TArray & undefined) | (TArray & null) | (TArray & T[]), iteratee?: _.ArrayIterator<T, any> | undefined): TArray;
	            <TString extends string | null | undefined>(collection: TString, iteratee?: _.StringIterator<any> | undefined): TString;
	            <T, TList extends ArrayLike<T> | null | undefined>(collection: (TList & undefined) | (TList & null) | (TList & ArrayLike<T>), iteratee?: _.ListIterator<T, any> | undefined): TList;
	            <T extends object>(collection: T | null | undefined, iteratee?: _.ObjectIterator<T, any> | undefined): T | null | undefined;
	        };
	        groupBy: {
	            <T>(collection: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): _.Dictionary<T[]>;
	            <T extends object>(collection: T | null | undefined, iteratee?: string | [string, any] | ((value: T[keyof T]) => _.NotVoid) | _.PartialDeep<T[keyof T]> | undefined): _.Dictionary<T[keyof T][]>;
	        };
	        includes: <T>(collection: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, target: T, fromIndex?: number | undefined) => boolean;
	        invokeMap: {
	            (collection: object | null | undefined, methodName: string, ...args: any[]): any[];
	            <TResult>(collection: object | null | undefined, method: (...args: any[]) => TResult, ...args: any[]): TResult[];
	        };
	        keyBy: {
	            <T>(collection: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | ((value: T) => PropertyKey) | _.PartialDeep<T> | undefined): _.Dictionary<T>;
	            <T extends object>(collection: T | null | undefined, iteratee?: string | [string, any] | ((value: T[keyof T]) => PropertyKey) | _.PartialDeep<T[keyof T]> | undefined): _.Dictionary<T[keyof T]>;
	        };
	        map: {
	            <T, TResult>(collection: T[] | null | undefined, iteratee: _.ArrayIterator<T, TResult>): TResult[];
	            <T, TResult>(collection: ArrayLike<T> | null | undefined, iteratee: _.ListIterator<T, TResult>): TResult[];
	            <T>(collection: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined): T[];
	            <T extends object, TResult>(collection: T | null | undefined, iteratee: _.ObjectIterator<T, TResult>): TResult[];
	            <T, K extends keyof T>(collection: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, iteratee: K): T[K][];
	            <T>(collection: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, iteratee?: string | undefined): any[];
	            <T>(collection: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, iteratee?: object | undefined): boolean[];
	        };
	        orderBy: {
	            <T>(collection: ArrayLike<T> | null | undefined, iteratees?: _.ListIterator<T, _.NotVoid> | _.ListIterator<T, _.NotVoid>[] | undefined, orders?: string | boolean | (string | boolean)[] | undefined): T[];
	            <T>(collection: ArrayLike<T> | null | undefined, iteratees?: string | [string, any] | _.ListIterator<T, _.NotVoid> | _.PartialDeep<T> | _.ListIteratee<T>[] | undefined, orders?: string | boolean | (string | boolean)[] | undefined): T[];
	            <T extends object>(collection: T | null | undefined, iteratees?: _.ObjectIterator<T, _.NotVoid> | _.ObjectIterator<T, _.NotVoid>[] | undefined, orders?: string | boolean | (string | boolean)[] | undefined): T[keyof T][];
	            <T extends object>(collection: T | null | undefined, iteratees?: string | [string, any] | _.ObjectIterator<T, _.NotVoid> | _.PartialDeep<T[keyof T]> | _.ObjectIteratee<T>[] | undefined, orders?: string | boolean | (string | boolean)[] | undefined): T[keyof T][];
	        };
	        partition: {
	            <T>(collection: ArrayLike<T> | null | undefined, callback: _.ValueIteratee<T>): [T[], T[]];
	            <T extends object>(collection: T | null | undefined, callback: _.ValueIteratee<T[keyof T]>): [T[keyof T][], T[keyof T][]];
	        };
	        reduce: {
	            <T, TResult>(collection: T[] | null | undefined, callback: _.MemoListIterator<T, TResult, T[]>, accumulator: TResult): TResult;
	            <T, TResult>(collection: ArrayLike<T> | null | undefined, callback: _.MemoListIterator<T, TResult, ArrayLike<T>>, accumulator: TResult): TResult;
	            <T extends object, TResult>(collection: T | null | undefined, callback: _.MemoObjectIterator<T[keyof T], TResult, T>, accumulator: TResult): TResult;
	            <T>(collection: T[] | null | undefined, callback: _.MemoListIterator<T, T, T[]>): T | undefined;
	            <T>(collection: ArrayLike<T> | null | undefined, callback: _.MemoListIterator<T, T, ArrayLike<T>>): T | undefined;
	            <T extends object>(collection: T | null | undefined, callback: _.MemoObjectIterator<T[keyof T], T[keyof T], T>): T[keyof T] | undefined;
	        };
	        reduceRight: {
	            <T, TResult>(collection: T[] | null | undefined, callback: _.MemoListIterator<T, TResult, T[]>, accumulator: TResult): TResult;
	            <T, TResult>(collection: ArrayLike<T> | null | undefined, callback: _.MemoListIterator<T, TResult, ArrayLike<T>>, accumulator: TResult): TResult;
	            <T extends object, TResult>(collection: T | null | undefined, callback: _.MemoObjectIterator<T[keyof T], TResult, T>, accumulator: TResult): TResult;
	            <T>(collection: T[] | null | undefined, callback: _.MemoListIterator<T, T, T[]>): T | undefined;
	            <T>(collection: ArrayLike<T> | null | undefined, callback: _.MemoListIterator<T, T, ArrayLike<T>>): T | undefined;
	            <T extends object>(collection: T | null | undefined, callback: _.MemoObjectIterator<T[keyof T], T[keyof T], T>): T[keyof T] | undefined;
	        };
	        reject: {
	            (collection: string | null | undefined, predicate?: _.StringIterator<boolean> | undefined): string[];
	            <T>(collection: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, boolean> | _.PartialDeep<T> | undefined): T[];
	            <T extends object>(collection: T | null | undefined, predicate?: string | [string, any] | _.ObjectIterator<T, boolean> | _.PartialDeep<T[keyof T]> | undefined): T[keyof T][];
	        };
	        sample: {
	            <T>(collection: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined): T | undefined;
	            <T extends object>(collection: T | null | undefined): T[keyof T] | undefined;
	        };
	        sampleSize: {
	            <T>(collection: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, n?: number | undefined): T[];
	            <T extends object>(collection: T | null | undefined, n?: number | undefined): T[keyof T][];
	        };
	        shuffle: {
	            <T>(collection: ArrayLike<T> | null | undefined): T[];
	            <T extends object>(collection: T | null | undefined): T[keyof T][];
	        };
	        size: (collection: string | object | null | undefined) => number;
	        some: {
	            <T>(collection: ArrayLike<T> | null | undefined, predicate?: string | [string, any] | _.ListIterator<T, boolean> | _.PartialDeep<T> | undefined): boolean;
	            <T extends object>(collection: T | null | undefined, predicate?: string | [string, any] | _.ObjectIterator<T, boolean> | _.PartialDeep<T[keyof T]> | undefined): boolean;
	        };
	        sortBy: {
	            <T>(collection: ArrayLike<T> | null | undefined, ...iteratees: _.Many<_.ListIteratee<T>>[]): T[];
	            <T extends object>(collection: T | null | undefined, ...iteratees: _.Many<_.ObjectIteratee<T>>[]): T[keyof T][];
	        };
	    };
	    static readonly Function: {
	        after: <TFunc extends (...args: any[]) => any>(n: number, func: TFunc) => TFunc;
	        ary: (func: (...args: any[]) => any, n?: number | undefined) => (...args: any[]) => any;
	        before: <TFunc extends (...args: any[]) => any>(n: number, func: TFunc) => TFunc;
	        bind: _.FunctionBind;
	        bindKey: _.FunctionBindKey;
	        curry: _.Curry;
	        curryRight: _.CurryRight;
	        debounce: <T extends (...args: any[]) => any>(func: T, wait?: number | undefined, options?: _.DebounceSettings | undefined) => T & _.Cancelable;
	        defer: (func: (...args: any[]) => any, ...args: any[]) => number;
	        delay: (func: (...args: any[]) => any, wait: number, ...args: any[]) => number;
	        flip: <T extends (...args: any[]) => any>(func: T) => T;
	        memoize: {
	            <T extends (...args: any[]) => any>(func: T, resolver?: ((...args: any[]) => any) | undefined): T & _.MemoizedFunction;
	            Cache: _.MapCacheConstructor;
	        };
	        negate: <T extends (...args: any[]) => any>(predicate: T) => T;
	        once: <T extends (...args: any[]) => any>(func: T) => T;
	        overArgs: (func: (...args: any[]) => any, ...transforms: _.Many<(...args: any[]) => any>[]) => (...args: any[]) => any;
	        partial: _.Partial;
	        partialRight: _.PartialRight;
	        rearg: (func: (...args: any[]) => any, ...indexes: _.Many<number>[]) => (...args: any[]) => any;
	        rest: (func: (...args: any[]) => any, start?: number | undefined) => (...args: any[]) => any;
	        spread: {
	            <TResult>(func: (...args: any[]) => TResult): (...args: any[]) => TResult;
	            <TResult>(func: (...args: any[]) => TResult, start: number): (...args: any[]) => TResult;
	        };
	        throttle: <T extends (...args: any[]) => any>(func: T, wait?: number | undefined, options?: _.ThrottleSettings | undefined) => T & _.Cancelable;
	        unary: <T, TResult>(func: (arg1: T, ...args: any[]) => TResult) => (arg1: T) => TResult;
	        wrap: {
	            <T, TArgs, TResult>(value: T, wrapper: (value: T, ...args: TArgs[]) => TResult): (...args: TArgs[]) => TResult;
	            <T, TResult>(value: T, wrapper: (value: T, ...args: any[]) => TResult): (...args: any[]) => TResult;
	        };
	    };
	    static readonly Object: {
	        assign: {
	            <TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
	            <TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2): TObject & TSource1 & TSource2;
	            <TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3): TObject & TSource1 & TSource2 & TSource3;
	            <TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4): TObject & TSource1 & TSource2 & TSource3 & TSource4;
	            <TObject>(object: TObject): TObject;
	            (object: any, ...otherArgs: any[]): any;
	        };
	        assignIn: {
	            <TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
	            <TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2): TObject & TSource1 & TSource2;
	            <TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3): TObject & TSource1 & TSource2 & TSource3;
	            <TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4): TObject & TSource1 & TSource2 & TSource3 & TSource4;
	            <TObject>(object: TObject): TObject;
	            <TResult>(object: any, ...otherArgs: any[]): TResult;
	        };
	        assignInWith: {
	            <TObject, TSource>(object: TObject, source: TSource, customizer: _.AssignCustomizer): TObject & TSource;
	            <TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2, customizer: _.AssignCustomizer): TObject & TSource1 & TSource2;
	            <TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, customizer: _.AssignCustomizer): TObject & TSource1 & TSource2 & TSource3;
	            <TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, customizer: _.AssignCustomizer): TObject & TSource1 & TSource2 & TSource3 & TSource4;
	            <TObject>(object: TObject): TObject;
	            <TResult>(object: any, ...otherArgs: any[]): TResult;
	        };
	        assignWith: {
	            <TObject, TSource>(object: TObject, source: TSource, customizer: _.AssignCustomizer): TObject & TSource;
	            <TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2, customizer: _.AssignCustomizer): TObject & TSource1 & TSource2;
	            <TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, customizer: _.AssignCustomizer): TObject & TSource1 & TSource2 & TSource3;
	            <TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, customizer: _.AssignCustomizer): TObject & TSource1 & TSource2 & TSource3 & TSource4;
	            <TObject>(object: TObject): TObject;
	            <TResult>(object: any, ...otherArgs: any[]): TResult;
	        };
	        at: {
	            <T>(object: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, ...props: _.Many<PropertyKey>[]): T[];
	            <T extends object>(object: T | null | undefined, ...props: _.Many<keyof T>[]): T[keyof T][];
	        };
	        create: <T extends object, U extends object>(prototype: T, properties?: U | undefined) => T & U;
	        defaults: {
	            <TObject, TSource>(object: TObject, source: TSource): TSource & TObject;
	            <TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2): TSource2 & TSource1 & TObject;
	            <TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3): TSource3 & TSource2 & TSource1 & TObject;
	            <TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4): TSource4 & TSource3 & TSource2 & TSource1 & TObject;
	            <TObject>(object: TObject): TObject;
	            (object: any, ...sources: any[]): any;
	        };
	        defaultsDeep: (object: any, ...sources: any[]) => any;
	        entries: {
	            <T>(object?: _.Dictionary<T> | _.NumericDictionary<T> | undefined): [string, T][];
	            (object?: object | undefined): [string, any][];
	        };
	        entriesIn: {
	            <T>(object?: _.Dictionary<T> | _.NumericDictionary<T> | undefined): [string, T][];
	            (object?: object | undefined): [string, any][];
	        };
	        extend: {
	            <TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
	            <TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2): TObject & TSource1 & TSource2;
	            <TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3): TObject & TSource1 & TSource2 & TSource3;
	            <TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4): TObject & TSource1 & TSource2 & TSource3 & TSource4;
	            <TObject>(object: TObject): TObject;
	            <TResult>(object: any, ...otherArgs: any[]): TResult;
	        };
	        findKey: <T>(object: T | null | undefined, predicate?: string | [string, any] | _.ObjectIterator<T, _.NotVoid> | _.PartialDeep<T[keyof T]> | undefined) => string | undefined;
	        findLastKey: <T>(object: T | null | undefined, predicate?: string | [string, any] | _.ObjectIterator<T, _.NotVoid> | _.PartialDeep<T[keyof T]> | undefined) => string | undefined;
	        forIn: {
	            <T>(object: T, iteratee?: _.ObjectIterator<T, any> | undefined): T;
	            <T>(object: T | null | undefined, iteratee?: _.ObjectIterator<T, any> | undefined): T | null | undefined;
	        };
	        forInRight: {
	            <T>(object: T, iteratee?: _.ObjectIterator<T, any> | undefined): T;
	            <T>(object: T | null | undefined, iteratee?: _.ObjectIterator<T, any> | undefined): T | null | undefined;
	        };
	        forOwn: {
	            <T>(object: T, iteratee?: _.ObjectIterator<T, any> | undefined): T;
	            <T>(object: T | null | undefined, iteratee?: _.ObjectIterator<T, any> | undefined): T | null | undefined;
	        };
	        forOwnRight: {
	            <T>(object: T, iteratee?: _.ObjectIterator<T, any> | undefined): T;
	            <T>(object: T | null | undefined, iteratee?: _.ObjectIterator<T, any> | undefined): T | null | undefined;
	        };
	        functions: (object: any) => string[];
	        functionsIn: <T extends {}>(object: any) => string[];
	        get: {
	            <TObject extends object, TKey extends keyof TObject>(object: TObject, path: TKey | [TKey]): TObject[TKey];
	            <TObject extends object, TKey extends keyof TObject>(object: TObject | null | undefined, path: TKey | [TKey]): TObject[TKey] | undefined;
	            <TObject extends object, TKey extends keyof TObject, TDefault>(object: TObject | null | undefined, path: TKey | [TKey], defaultValue: TDefault): TDefault | TObject[TKey];
	            <T>(object: _.NumericDictionary<T>, path: number): T;
	            <T>(object: _.NumericDictionary<T> | null | undefined, path: number): T | undefined;
	            <T, TDefault>(object: _.NumericDictionary<T> | null | undefined, path: number, defaultValue: TDefault): T | TDefault;
	            <TDefault>(object: null | undefined, path: _.Many<PropertyKey>, defaultValue: TDefault): TDefault;
	            (object: null | undefined, path: _.Many<PropertyKey>): undefined;
	            (object: any, path: _.Many<PropertyKey>, defaultValue?: any): any;
	        };
	        has: <T>(object: T, path: _.Many<PropertyKey>) => boolean;
	        hasIn: <T>(object: T, path: _.Many<PropertyKey>) => boolean;
	        invert: (object: object) => _.Dictionary<string>;
	        invertBy: {
	            <T>(object: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, interatee?: string | [string, any] | ((value: T) => _.NotVoid) | _.PartialDeep<T> | undefined): _.Dictionary<string[]>;
	            <T extends object>(object: T | null | undefined, interatee?: string | [string, any] | ((value: T[keyof T]) => _.NotVoid) | _.PartialDeep<T[keyof T]> | undefined): _.Dictionary<string[]>;
	        };
	        invoke: (object: any, path: _.Many<PropertyKey>, ...args: any[]) => any;
	        keys: (object?: any) => string[];
	        keysIn: (object?: any) => string[];
	        mapKeys: {
	            <T>(object: ArrayLike<T> | null | undefined, iteratee?: string | [string, any] | _.ListIterator<T, _.NotVoid> | _.PartialDeep<T> | undefined): _.Dictionary<T>;
	            <T extends object>(object: T | null | undefined, iteratee?: string | [string, any] | _.ObjectIterator<T, _.NotVoid> | _.PartialDeep<T[keyof T]> | undefined): _.Dictionary<T[keyof T]>;
	        };
	        mapValues: {
	            <TResult>(obj: string | null | undefined, callback: _.StringIterator<TResult>): _.NumericDictionary<TResult>;
	            <T, TResult>(obj: _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, callback: _.ObjectIterator<_.Dictionary<T>, TResult>): _.Dictionary<TResult>;
	            <T extends object, TResult>(obj: T | null | undefined, callback: _.ObjectIterator<T, TResult>): { [P in keyof T]: TResult; };
	            <T>(obj: _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, iteratee: object): _.Dictionary<boolean>;
	            <T extends object>(obj: T | null | undefined, iteratee: object): { [P in keyof T]: boolean; };
	            <T, TKey extends keyof T>(obj: _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, iteratee: TKey): _.Dictionary<T[TKey]>;
	            <T>(obj: _.Dictionary<T> | _.NumericDictionary<T> | null | undefined, iteratee: string): _.Dictionary<any>;
	            <T extends object>(obj: T | null | undefined, iteratee: string): { [P in keyof T]: any; };
	            (obj: string | null | undefined): _.NumericDictionary<string>;
	            <T>(obj: _.Dictionary<T> | _.NumericDictionary<T> | null | undefined): _.Dictionary<T>;
	            <T extends object>(obj: T): T;
	            <T extends object>(obj: T | null | undefined): Partial<T>;
	        };
	        merge: {
	            <TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
	            <TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2): TObject & TSource1 & TSource2;
	            <TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3): TObject & TSource1 & TSource2 & TSource3;
	            <TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4): TObject & TSource1 & TSource2 & TSource3 & TSource4;
	            (object: any, ...otherArgs: any[]): any;
	        };
	        mergeWith: {
	            <TObject, TSource>(object: TObject, source: TSource, customizer: (value: any, srcValue: any, key: string, object: any, source: any) => any): TObject & TSource;
	            <TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2, customizer: (value: any, srcValue: any, key: string, object: any, source: any) => any): TObject & TSource1 & TSource2;
	            <TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, customizer: (value: any, srcValue: any, key: string, object: any, source: any) => any): TObject & TSource1 & TSource2 & TSource3;
	            <TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, customizer: (value: any, srcValue: any, key: string, object: any, source: any) => any): TObject & TSource1 & TSource2 & TSource3 & TSource4;
	            (object: any, ...otherArgs: any[]): any;
	        };
	        omit: {
	            <T extends _.AnyKindOfDictionary>(object: T | null | undefined, ...paths: _.Many<PropertyKey>[]): T;
	            <T extends object, K extends keyof T>(object: T | null | undefined, ...paths: _.Many<K>[]): Pick<T, ({ [P in keyof T]: P; } & { [P in K]: never; } & {
	                [x: string]: never;
	            })[keyof T]>;
	            <T extends object>(object: T | null | undefined, ...paths: _.Many<PropertyKey>[]): Partial<T>;
	        };
	        omitBy: <T extends object>(object: T | null | undefined, predicate: _.ValueKeyIteratee<T[keyof T]>) => Partial<T>;
	        pick: {
	            <T extends object, U extends keyof T>(object: T, ...props: _.Many<U>[]): Pick<T, U>;
	            <T>(object: T | null | undefined, ...props: _.Many<PropertyKey>[]): _.PartialDeep<T>;
	        };
	        pickBy: <T extends object>(object: T | null | undefined, predicate?: string | [string, any] | ((value: T[keyof T], key: string) => _.NotVoid) | _.PartialDeep<T[keyof T]> | undefined) => Partial<T>;
	        result: <TResult>(object: any, path: _.Many<PropertyKey>, defaultValue?: TResult | ((...args: any[]) => TResult) | undefined) => TResult;
	        set: {
	            <T extends object>(object: T, path: _.Many<PropertyKey>, value: any): T;
	            <TResult>(object: object, path: _.Many<PropertyKey>, value: any): TResult;
	        };
	        setWith: {
	            <T extends object>(object: T, path: _.Many<PropertyKey>, value: any, customizer?: _.SetWithCustomizer<T> | undefined): T;
	            <T extends object, TResult>(object: T, path: _.Many<PropertyKey>, value: any, customizer?: _.SetWithCustomizer<T> | undefined): TResult;
	        };
	        toPairs: {
	            <T>(object?: _.Dictionary<T> | _.NumericDictionary<T> | undefined): [string, T][];
	            (object?: object | undefined): [string, any][];
	        };
	        toPairsIn: {
	            <T>(object?: _.Dictionary<T> | _.NumericDictionary<T> | undefined): [string, T][];
	            (object?: object | undefined): [string, any][];
	        };
	        transform: {
	            <T, TResult>(object: T[], iteratee: _.MemoVoidArrayIterator<T, TResult[]>, accumulator?: TResult[] | undefined): TResult[];
	            <T, TResult>(object: T[], iteratee: _.MemoVoidArrayIterator<T, _.Dictionary<TResult>>, accumulator: _.Dictionary<TResult>): _.Dictionary<TResult>;
	            <T, TResult>(object: _.Dictionary<T>, iteratee: _.MemoVoidDictionaryIterator<T, _.Dictionary<TResult>>, accumulator?: _.Dictionary<TResult> | undefined): _.Dictionary<TResult>;
	            <T, TResult>(object: _.Dictionary<T>, iteratee: _.MemoVoidDictionaryIterator<T, TResult[]>, accumulator: TResult[]): TResult[];
	            (object: any[]): any[];
	            (object: object): _.Dictionary<any>;
	        };
	        unset: (object: any, path: _.Many<PropertyKey>) => boolean;
	        update: (object: object, path: _.Many<PropertyKey>, updater: (value: any) => any) => any;
	        updateWith: {
	            <T extends object>(object: T, path: _.Many<PropertyKey>, updater: (oldValue: any) => any, customizer?: _.SetWithCustomizer<T> | undefined): T;
	            <T extends object, TResult>(object: T, path: _.Many<PropertyKey>, updater: (oldValue: any) => any, customizer?: _.SetWithCustomizer<T> | undefined): TResult;
	        };
	        values: {
	            <T>(object: _.Dictionary<T> | _.NumericDictionary<T> | ArrayLike<T> | null | undefined): T[];
	            <T extends object>(object: T | null | undefined): T[keyof T][];
	            (object: any): any[];
	        };
	        valuesIn: {
	            <T>(object: _.Dictionary<T> | _.NumericDictionary<T> | ArrayLike<T> | null | undefined): T[];
	            <T extends object>(object: T | null | undefined): T[keyof T][];
	        };
	    };
	    static readonly Lang: {
	        castArray: <T>(value?: T | T[] | undefined) => T[];
	        clone: <T>(value: T) => T;
	        cloneDeep: <T>(value: T) => T;
	        cloneDeepWith: {
	            <T>(value: T, customizer: _.CloneDeepWithCustomizer<T>): any;
	            <T>(value: T): T;
	        };
	        cloneWith: {
	            <T, TResult extends string | number | boolean | object | null>(value: T, customizer: _.CloneWithCustomizer<T, TResult>): TResult;
	            <T, TResult>(value: T, customizer: _.CloneWithCustomizer<T, TResult | undefined>): T | TResult;
	            <T>(value: T): T;
	        };
	        conformsTo: <T>(object: T, source: _.ConformsPredicateObject<T>) => boolean;
	        eq: (value: any, other: any) => boolean;
	        gt: (value: any, other: any) => boolean;
	        gte: (value: any, other: any) => boolean;
	        isArguments: (value?: any) => value is IArguments;
	        isArray: {
	            (value?: any): value is any[];
	            <T>(value?: any): value is any[];
	        };
	        isArrayBuffer: (value?: any) => value is ArrayBuffer;
	        isArrayLike: {
	            <T>(value: T & string & number): boolean;
	            (value: ((...args: any[]) => any) | null | undefined): value is never;
	            (value: any): value is {
	                length: number;
	            };
	        };
	        isArrayLikeObject: {
	            <T>(value: T & string & number): boolean;
	            (value: string | number | boolean | Function | ((...args: any[]) => any) | null | undefined): value is never;
	            <T extends object>(value: string | number | boolean | Function | T | ((...args: any[]) => any) | null | undefined): value is T & {
	                length: number;
	            };
	        };
	        isBoolean: (value?: any) => value is boolean;
	        isBuffer: (value?: any) => boolean;
	        isDate: (value?: any) => value is Date;
	        isElement: (value?: any) => boolean;
	        isEmpty: (value?: any) => boolean;
	        isEqual: (value: any, other: any) => boolean;
	        isEqualWith: (value: any, other: any, customizer?: _.IsEqualCustomizer | undefined) => boolean;
	        isError: (value: any) => value is Error;
	        isFinite: (value?: any) => boolean;
	        isFunction: (value: any) => value is (...args: any[]) => any;
	        isInteger: (value?: any) => boolean;
	        isLength: (value?: any) => boolean;
	        isMap: (value?: any) => value is Map<any, any>;
	        isMatch: (object: object, source: object) => boolean;
	        isMatchWith: (object: object, source: object, customizer: _.isMatchWithCustomizer) => boolean;
	        isNaN: (value?: any) => boolean;
	        isNative: (value: any) => value is (...args: any[]) => any;
	        isNil: (value: any) => value is null | undefined;
	        isNull: (value: any) => value is null;
	        isNumber: (value?: any) => value is number;
	        isObject: (value?: any) => boolean;
	        isObjectLike: (value?: any) => boolean;
	        isPlainObject: (value?: any) => boolean;
	        isRegExp: (value?: any) => value is RegExp;
	        isSafeInteger: (value: any) => boolean;
	        isSet: (value?: any) => value is Set<any>;
	        isString: (value?: any) => value is string;
	        isSymbol: (value: any) => boolean;
	        isTypedArray: (value: any) => boolean;
	        isUndefined: (value: any) => value is undefined;
	        isWeakMap: (value?: any) => value is WeakMap<object, any>;
	        isWeakSet: (value?: any) => value is WeakSet<object>;
	        lt: (value: any, other: any) => boolean;
	        lte: (value: any, other: any) => boolean;
	        toArray: {
	            <T>(value: ArrayLike<T> | _.Dictionary<T> | _.NumericDictionary<T> | null | undefined): T[];
	            <T>(value: T): T[keyof T][];
	            (): any[];
	        };
	        toFinite: (value: any) => number;
	        toInteger: (value: any) => number;
	        toLength: (value: any) => number;
	        toNumber: (value: any) => number;
	        toPlainObject: (value?: any) => any;
	        toSafeInteger: (value: any) => number;
	        toString: (value: any) => string;
	    };
	    static readonly Performace: PerformanceHelper;
	}

	//declarations/cache/EntityCache.d.ts
	export type CacheEvitCallback<E extends object> = (key: CacheKey, entity: E) => void;
	export interface Cache<E extends object> {
	    model: ModelSchema<E>;
	    onEvit: CacheEvitCallback<E>;
	    clear(): void;
	    has(key: CacheKey): boolean;
	    get(key: CacheKey): MaybeUndefined<E>;
	    forEach(callback: (e, key) => void): any;
	    set(key: CacheKey, entity: E): void;
	    evit(key: CacheKey): void;
	    exists(key: CacheKey): boolean;
	}
	export interface EntityUniqueIndex<E extends object> {
	    indexName: string;
	    fields: Property<E>[];
	    exists(uniqueKey: UniqueKey<E>): boolean;
	    get(uniqueKey: UniqueKey<E>): MaybeUndefined<string>;
	    add(uniqueKey: UniqueKey<E>, key: string): void;
	    delete(uniqueKey: UniqueKey<E>): void;
	}
	export class DefaultEntityUniqueIndex<E extends object> implements EntityUniqueIndex<E> {
	    constructor(name: string, indexFields: Property<E>[]);
	    readonly indexName: string;
	    readonly fields: Property<E>[];
	    exists(uniqueKey: UniqueKey<E>): boolean;
	    get(uniqueKey: UniqueKey<E>): MaybeUndefined<string>;
	    add(uniqueKey: UniqueKey<E>, key: string): void;
	    delete(uniqueKey: UniqueKey<E>): void;
	}
	export type CacheKey = number | string;
	export class UniquedCache<E extends object> {
	    constructor(cache: Cache<E>, uniquedIndexes: ModelIndex<E>[]);
	    has(key: string): boolean;
	    set(key: CacheKey, entity: E): void;
	    get(key: CacheKey): MaybeUndefined<E>;
	    forEach(callback: (e: E, key: string) => void): void;
	    evit(key: CacheKey): void;
	    getUnique(uniqueIndexName: string, uniqueKey: UniqueKey<E>): MaybeUndefined<E>;
	    clear(): void;
	}
	export interface EntityCache {
	    models: ModelSchema<Entity>[];
	    clear(modelName?: string): void;
	    get<E extends object>(modelName: string, key: PrimaryKey<E>): MaybeUndefined<E>;
	    getUnique<E extends object>(modelName: string, uniqueName: string, uniqueKey: UniqueKey<E>): MaybeUndefined<E>;
	    existsUnique<E extends object>(modelName: string, uniqueName: string, uniqueKey: UniqueKey<E>): boolean;
	    getAll<E extends object>(modelName: string, filter?: FilterFunction<E>): MaybeUndefined<E[]>;
	    put<E extends object>(modelName: string, key: PrimaryKey<E>, entity: E): void;
	    evit<E extends object>(modelName: string, key: PrimaryKey<E>): void;
	    exists<E extends object>(modelName: string, key: PrimaryKey<E>): boolean;
	    existsModel(modelName: string): boolean;
	    refreshUniques<E extends object>(modelName: string, key: PrimaryKey<E>): boolean;
	}
	export class UniquedEntityCache implements EntityCache {
	    constructor(log: Logger, schemas: Map<string, ModelSchema<Entity>>);
	    registerModel<E extends object>(schema: ModelSchema<E>, uniqueIndexes: ModelIndex<E>[]): void;
	    unRegisterModel(modelName: string): void;
	    clear(modelName?: string): void;
	    readonly models: ModelSchema<Entity>[];
	    get<E extends object>(modelName: string, key: PrimaryKey<E>): MaybeUndefined<E>;
	    getUnique<E extends object>(modelName: string, uniqueName: string, uniqueKey: UniqueKey<E>): MaybeUndefined<E>;
	    existsUnique<E extends object>(modelName: string, uniqueName: string, uniqueKey: UniqueKey<E>): boolean;
	    refreshUniques<E extends object>(modelName: string, key: PrimaryKey<E>): boolean;
	    getAll<E extends object>(modelName: string, filter?: FilterFunction<E>): MaybeUndefined<E[]>;
	    put<E extends object>(modelName: string, key: PrimaryKey<E>, entity: Entity): void;
	    evit<E extends object>(modelName: string, key: PrimaryKey<E>): void;
	    exists<E extends object>(modelName: string, key: PrimaryKey<E>): boolean;
	    existsModel(modelName: string): boolean;
	    dumpCache(): string;
	}

	//declarations/cache/LRUEntityCache.d.ts
	export type LRUEntityCacheOptions = {
	    default: number;
	    [model: string]: number | ((model: string) => number);
	};
	export class LRUEntityCache extends UniquedEntityCache {
	    constructor(schemas: Map<string, ModelSchema<Entity>>, options?: LRUEntityCacheOptions);
	}

	//declarations/cache/NonExpiredEntityCache.d.ts
	export class NonExpiredEntityCache extends UniquedEntityCache {
	    constructor(schemas: Map<string, ModelSchema<Entity>>);
	}

	//declarations/kvdb/LevelDB.d.ts
	export type GetIndexValueFunc = (key: any, value: JsonObject) => any;
	export type IndexField = {
	    fieldName: string;
	    calcIndex?: GetIndexValueFunc;
	};
	export class SubLevelMeta {
	    subName: string;
	    keyField: string;
	    indexFields: IndexField[];
	    constructor(subName: string, keyField: string, indexFields?: IndexField[]);
	    existsIndex(fieldName: string): boolean;
	    addIndex(fieldName: string, calcIndex: GetIndexValueFunc): this;
	    removeIndex(fieldName: any): this;
	}
	export interface LevelReadableStream extends ReadableStream {
	    on(eventName: string, callback: Function): LevelReadableStream;
	}
	export interface LevelGet {
	    get<T>(key: any, options?: JsonObject, getCallback?: Callback<MaybeUndefined<T>>): Promise<MaybeUndefined<T>>;
	    createReadStream(options?: JsonObject): LevelReadableStream;
	    createKeyStream(options?: JsonObject): LevelReadableStream;
	    createValueStream(options?: JsonObject): LevelReadableStream;
	}
	export interface LevelOperation {
	    put<T>(key: any, value: T, options?: JsonObject, callback?: Callback<void>): Promise<void>;
	    del(key: any, delCallback?: Callback<void>): Promise<void>;
	    batch(operArray: JsonObject[], options?: JsonObject): Promise<void>;
	}
	export interface IndexedLevel extends LevelGet, LevelOperation {
	    name: string;
	    indexes: IndexField[];
	    byIndex(indexField: string): LevelGet;
	    getBy<T>(indexField: string, key: any, getCallback?: Callback<MaybeUndefined<T>>): Promise<MaybeUndefined<T>>;
	}
	export class LevelDB {
	    constructor(dbDir: string, meta: SubLevelMeta[], options?: {});
	    static isKeyNotFoundError(err: Error): boolean;
	    readonly level: any;
	    getSubLevel(subName: string): IndexedLevel;
	    open(openCallback?: Callback<any>): Promise<void> | null;
	    close(closeCallback?: Callback<any>): Promise<void> | null;
	    readonly isOpen: any;
	    readonly isClosed: any;
	    dump(): Promise<string>;
	}

	//declarations/memdb/Membase.d.ts
	export type BinaryOperators = '$eq' | '$ne' | '$gt' | '$lt' | '$gte' | '$lte' | '$in' | '$nin' | '$between';
	export type RelationOperators = '$not' | '$and' | '$or';
	export type ValueExpression = string | number;
	export type FieldValueExpression = {
	    [field: string]: string | number;
	};
	export type FieldArrayValueExpression = {
	    [field: string]: SimpleKey[];
	};
	export type ValueCompareExpression = FieldValueExpression | {
	    [field: string]: {
	        [oper in '$eq' | '$ne' | '$gt' | '$lt' | '$gte' | '$lte']?: ValueExpression;
	    };
	};
	export type ArrayCompareExpression = FieldArrayValueExpression | {
	    [field: string]: {
	        [oper in '$between' | '$in' | '$nin']?: ValueExpression[];
	    };
	};
	export type UniqueCondition<E> = Partial<E>;
	export type MembaseCondition = ValueCompareExpression | ArrayCompareExpression;
	export interface EntityIndex<E extends object> {
	    isUnique: boolean;
	    fields: (keyof E)[];
	}
	export interface EntityCollection<E extends object> {
	    modelName: string;
	    indexes: Iterable<EntityIndex<E>>;
	    insert: (entity: E) => E;
	    update: (entity: E) => MaybeUndefined<E>;
	    delete: (entity: E) => MaybeUndefined<E>;
	    get: (condition: UniqueCondition<E>) => MaybeUndefined<E>;
	    getAll: () => Array<E>;
	    find: (condition: MembaseCondition) => Array<E>;
	}
	export interface Membase {
	    collections: Iterable<EntityCollection<any>>;
	    getCollection: <E extends object>(name: string) => MaybeUndefined<EntityCollection<E>>;
	    addCollection: <E extends object>(name: string, indexes: EntityIndex<E>[]) => EntityCollection<E>;
	    removeCollection: (name: string) => void;
	}
	export class MembaseFactory {
	    static readonly instance: MembaseFactory;
	    createMembase(): Membase;
	    fromModels(schemas: ModelSchema<Entity>[]): Membase;
	}

	//declarations/sqldb/DbConnection.d.ts
	export type ConnectionOptions = {
	    [keys in 'storage' | 'userName' | 'password' | 'database']?: any;
	};
	export interface SqlExecuteResult {
	    lastInsertRowId: string;
	    rowsEffected: number;
	}
	export interface DbConnection {
	    connectionOptions: ConnectionOptions;
	    isConnected: boolean;
	    connect(): Promise<boolean>;
	    disconnect(): Promise<boolean>;
	    runScript(sql: string): Promise<void>;
	    query(sql: string, parameters?: SqlParameters): Promise<DbRecord[]>;
	    querySync(sql: string, parameters?: SqlParameters): DbRecord[];
	    execute(sql: string, parameters?: SqlParameters, throwIfNoneEffected?: boolean): Promise<SqlExecuteResult>;
	    executeSync(sql: string, parameters?: SqlParameters, throwIfNoneEffected?: boolean): SqlExecuteResult;
	    executeBatchSync(sqls: SqlAndParameters[]): SqlExecuteResult[];
	    executeBatch(sqls: SqlAndParameters[]): Promise<SqlExecuteResult[]>;
	    beginTrans(): Promise<DBTransaction>;
	}
	export interface DBTransaction {
	    commit(): Promise<void>;
	    rollback(): Promise<void>;
	}

	//declarations/sqldb/SqlBuilder.d.ts
	export const MULTI_SQL_SEPARATOR = ";";
	export enum SqlType {
	    Schema = 0,
	    Select = 1,
	    Insert = 2,
	    Update = 3,
	    Delete = 4,
	    Other = 9,
	}
	export type SqlParameters = Array<any> | JsonObject;
	export type SqlAndParameters = {
	    type: SqlType;
	    query: string;
	    parameters?: SqlParameters;
	    expectEffected?: boolean;
	};
	export type UnaryOperators = '$null' | '$is' | '$isnot';
	export type BinaryOperators = '$eq' | '$ne' | '$gt' | '$lt' | '$gte' | '$lte' | '$like' | '$field' | '$in' | '$nin' | '$between';
	export type RelationOperators = '$not' | '$and' | '$or';
	export type SelectExpression = {
	    select: {
	        table: string;
	        fields?: string[];
	        where?: string;
	        [key: string]: any;
	    };
	};
	export type ValueExpression = string | number;
	export type FieldValueExpression = {
	    [field: string]: string | number;
	};
	export type FieldArrayValueExpression = {
	    [field: string]: SimpleKey[];
	};
	export type NullCompareExpression = {
	    $null: string;
	} | {
	    [oper in '$is' | 'isnot']?: {
	        [field: string]: null;
	    };
	};
	export type ValueCompareExpression = FieldValueExpression | {
	    [field: string]: {
	        [oper in '$eq' | '$ne' | '$gt' | '$lt' | '$gte' | '$lte']?: ValueExpression | SelectExpression;
	    };
	};
	export type ArrayCompareExpression = FieldArrayValueExpression | {
	    [field: string]: {
	        [oper in '$between' | '$in' | '$nin']?: ValueExpression[] | SelectExpression;
	    };
	};
	export type LikeExpression = {
	    [key: string]: {
	        $like: string;
	    };
	};
	export type CompareExpression = ValueCompareExpression | ArrayCompareExpression | LikeExpression | NullCompareExpression;
	export type RelationExpression = CompareExpression[] | {
	    $not: CompareExpression | RelationExpression;
	} | {
	    [oper in '$and' | '$or']?: CompareExpression[] | RelationExpression[];
	};
	export type SqlCondition = CompareExpression | RelationExpression;
	export type LimitAndOffset = {
	    limit?: number;
	    offset?: number;
	};
	export type SqlResultRange = number | LimitAndOffset;
	export type SqlOrderItem = {
	    [field: string]: 'ASC' | 'DESC' | 1 | -1;
	};
	export type SqlOrder = SqlOrderItem | SqlOrderItem[];
	export interface SqlBuilder {
	    buildSchema<E extends object>(schema: ModelSchema<E>): string[];
	    buildInsert<E extends object>(schema: ModelSchema<E>, fieldValues: JsonObject): SqlAndParameters;
	    buildDelete<E extends object>(schema: ModelSchema<E>, key: PrimaryKey<E>): SqlAndParameters;
	    buildUpdate<E extends object>(schema: ModelSchema<E>, key: PrimaryKey<E>, fieldValues: JsonObject, version: number): SqlAndParameters;
	    buildSelect<E extends object>(schema: ModelSchema<E>, params: JsonObject): SqlAndParameters;
	    buildSelect<E extends object>(schema: ModelSchema<E>, fields: string[], where: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, join?: JsonObject): SqlAndParameters;
	}
	export class JsonSqlBuilder implements SqlBuilder {
	    buildSchema<E extends object>(schema: ModelSchema<E>): string[];
	    buildInsert<E extends object>(schema: ModelSchema<E>, fieldValues: JsonObject): SqlAndParameters;
	    buildDelete<E extends object>(schema: ModelSchema<E>, key: PrimaryKey<E>): SqlAndParameters;
	    buildUpdate<E extends object>(schema: ModelSchema<E>, key: PrimaryKey<E>, fieldValues: JsonObject, version: number): SqlAndParameters;
	    buildSelect<E extends object>(schema: ModelSchema<E>, fieldsOrParams: string[] | JsonObject, where?: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, join?: JsonObject): SqlAndParameters;
	}

	//declarations/sqldb/SqliteConnection.d.ts
	export class SqliteConnection implements DbConnection {
	    constructor(options: ConnectionOptions);
	    readonly connectionOptions: ConnectionOptions;
	    readonly isConnected: boolean;
	    connect(): Promise<boolean>;
	    disconnect(): Promise<boolean>;
	    query(sql: string, parameters?: SqlParameters): Promise<DbRecord[]>;
	    querySync(sql: string, parameters?: SqlParameters): DbRecord[];
	    executeBatchSync(sqls: SqlAndParameters[]): SqlExecuteResult[];
	    executeBatch(sqls: SqlAndParameters[]): Promise<SqlExecuteResult[]>;
	    executeSync(sql: string, parameters?: SqlParameters, throwIfNoneEffected?: boolean): SqlExecuteResult;
	    execute(sql: string, parameters?: SqlParameters, throwIfNoneEffected?: boolean): Promise<SqlExecuteResult>;
	    runScript(sql: string): Promise<void>;
	    beginTrans(): Promise<DBTransaction>;
	}

	//declarations/sqldb/SqliteWrapper.d.ts
	export class SqliteWrapper {
	    constructor();
	    open(dbFilePath: string, callback?: Callback<boolean>): boolean;
	    readonly isConnected: boolean;
	    asynOpen(dbFilePath: string): Promise<boolean>;
	    close(callback?: Callback<boolean>): boolean;
	    asynClose(): Promise<boolean>;
	    execute(sql: string, parameters?: SqlParameters, callback?: Callback<SqlExecuteResult>): SqlExecuteResult;
	    query(sql: string, parameters?: SqlParameters, callback?: Callback<any[]>): any[];
	    executeBatch(sqls: SqlAndParameters[], onExecuted?: (ret: SqlExecuteResult, s: SqlAndParameters) => void, callback?: Callback<SqlExecuteResult[]>): SqlExecuteResult[];
	    asynExecute(sql: any, parameters?: SqlParameters): Promise<SqlExecuteResult>;
	    asynQuery(sql: string, parameters?: SqlParameters): Promise<any[]>;
	    asyncExecuteBatch(sqls: SqlAndParameters[], onExecuted?: (ret: SqlExecuteResult, s: SqlAndParameters) => void): Promise<SqlExecuteResult[]>;
	}

	//declarations/tracker/BasicEntityTracker.d.ts
	export type LoadChangesHistoryAction = (fromVersion: number, toVersion: number) => Promise<Map<number, ChangesHistoryItem<Entity>[]>>;
	export class BasicEntityTracker implements EntityTracker {
	    makeModelAndKey<E extends object>(schema: ModelSchema<E>, key: PrimaryKey<E>): ModelAndKey;
	    splitModelAndKey<E extends object>(modelAndKey: ModelAndKey): {
	        model: string;
	        key: PrimaryKey<E>;
	    };
	    readonly trackingEntities: Iterable<TrackingEntity<Entity>>;
	    isTracking<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): boolean;
	    getTrackingChanges(): ChangesHistoryItem<Entity>[];
	    detectChanges(): TrackingEntityChangesItem<Entity>[];
	    trackNew<E extends object>(schema: ModelSchema<E>, entity: E): TrackingEntity<Versioned<E>>;
	    trackPersistent<E extends object>(schema: ModelSchema<E>, entity: Versioned<E>): TrackingEntity<Versioned<E>>;
	    trackDelete<E extends object>(schema: ModelSchema<E>, te: TrackingEntity<Versioned<E>>): void;
	    trackModify<E extends object>(schema: ModelSchema<E>, te: TrackingEntity<Versioned<E>>, modifier: Partial<E>): void;
	    getTrackingEntity<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): MaybeUndefined<TrackingEntity<Versioned<E>>>;
	    stopTrack<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): void;
	    stopTrackAll(): void;
	    acceptChanges(historyVersion: number): void;
	    rejectChanges(): void;
	    rollbackChanges(historyVersion: number): Promise<void>;
	    readonly isConfirming: boolean;
	    beginConfirm(): void;
	    confirm(): void;
	    cancelConfirm(): void;
	        min: number;
	        max: number;
	    };
	    getChangesUntil(historyVersion: number): Promise<Map<ModelAndKey, EntityChanges<Entity>>[]>;
	}

	//declarations/tracker/EntityStateManager.d.ts
	export const ENTITY_VERSION_PROPERTY = "_version_";
	export const ENTITY_EXTENSION_SYMBOL = "__extension__";
	export type Versioned<E extends object> = Minix<E, {
	    '_version_': number;
	}>;
	export interface EntityStateManager<E extends object> {
	    readonly version: number;
	    readonly state: EntityState;
	    readonly confirmed: boolean;
	    readonly dirty: boolean;
	    readonly schema: ModelSchema<E>;
	    readonly primaryKey: PrimaryKey<E>;
	    readonly entity: E;
	    readonly deletedOrTransient: boolean;
	    getConfirmedChanges(): MaybeUndefined<EntityChanges<E>>;
	    trackNew(confirming: boolean): void;
	    trackDelete(confirming: boolean): void;
	    trackModify(confirming: boolean, ...modifiedProperties: PropertyValue<E>[]): void;
	    acceptChanges(historyVersion: number): void;
	    undoChanges(changes?: EntityChanges<E>): void;
	    confirm(): void;
	    cancelConfirm(): void;
	    rejectChanges(): void;
	}
	export type TrackerSaveHistoryAction<E extends object> = (schema: ModelSchema<E>, entity: E, changes: EntityChanges<E>, historyVersion: number) => void;
	export class DefaultEntityStateManager<E extends object> implements EntityStateManager<E> {
	    state: EntityState;
	    schema: ModelSchema<E>;
	    changes: Nullable<EntityChanges<E>>;
	    entity: Versioned<E>;
	    constructor(schema: ModelSchema<E>, entity: Versioned<E>, state: EntityState);
	    readonly dirty: boolean;
	    readonly deletedOrTransient: boolean;
	    version: number;
	    readonly confirmed: boolean;
	    readonly primaryKey: PrimaryKey<E>;
	    acceptChanges(historyVersion: number): void;
	    getConfirmedChanges(): MaybeUndefined<EntityChanges<E>>;
	    trackNew(confirming: boolean): void;
	    trackDelete(confirming: boolean): void;
	    trackModify(confirming: boolean, ...modifiedProperties: PropertyValue<E>[]): void;
	    confirm(): void;
	    undoChanges(changes?: EntityChanges<E>): void;
	    cancelConfirm(): void;
	    rejectChanges(): void;
	}

	//declarations/tracker/EntityTracker.d.ts
	export enum EntityState {
	    Transient = -1,
	    Persistent = 0,
	    New = 1,
	    Modified = 2,
	    Deleted = 3,
	}
	/******************************/
	/******************************/
	export enum EntityChangeType {
	    New = 1,
	    Modify = 2,
	    Delete = 3,
	}
	export interface PropertyChange<E extends object> {
	    name: string & ((keyof E) | '_version_');
	    original: any;
	    current: any;
	}
	export interface PropertyValue<E extends object> {
	    name: Property<E>;
	    value: any;
	}
	export interface EntityChanges<E extends object> {
	    dbVersion: number;
	    unconfirmed: boolean;
	    previousState: EntityState;
	    type: EntityChangeType;
	    propertyChanges: PropertyChange<E>[];
	}
	export type ModelAndKey = string;
	export type ChangesHistoryItem<E extends object> = {
	    modelAndKey: ModelAndKey;
	    changes?: EntityChanges<E>;
	};
	export type TrackingEntityChangesItem<E extends object> = {
	    schema: ModelSchema<E>;
	    key: PrimaryKey<E>;
	    changes: EntityChanges<E>;
	};
	export type TrackingEntity<E extends object> = Minix<E, {
	    getStateManager: () => EntityStateManager<E>;
	}>;
	export interface EntityTracker {
	    readonly trackingEntities: Iterable<Entity>;
	    isTracking<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): boolean;
	    getTrackingEntity<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): MaybeUndefined<TrackingEntity<Versioned<E>>>;
	    getTrackingChanges(): ChangesHistoryItem<Entity>[];
	    trackNew<E extends object>(schema: ModelSchema<E>, entity: E): TrackingEntity<Versioned<E>>;
	    trackPersistent<E extends object>(schema: ModelSchema<E>, entityWithVersion: Versioned<E>): TrackingEntity<Versioned<E>>;
	    trackModify<E extends object>(schema: ModelSchema<E>, te: TrackingEntity<Versioned<E>>, modifier: Partial<E>): void;
	    trackDelete<E extends object>(schema: ModelSchema<E>, te: TrackingEntity<Versioned<E>>): void;
	    stopTrack<E extends object>(schema: ModelSchema<E>, entity: E): void;
	    stopTrackAll(): void;
	    acceptChanges(historyVersion: number): void;
	    rejectChanges(): void;
	    rollbackChanges(historyVersion: number): Promise<void>;
	    isConfirming: boolean;
	    beginConfirm(): void;
	    confirm(): void;
	    cancelConfirm(): void;
	}

	//declarations/tracker/SnapshotEntityTracker.d.ts
	export class SnapshotEntityTracker extends BasicEntityTracker implements EntityTracker {
	    constructor(cache: EntityCache, schemas: Map<string, ModelSchema<Entity>>, maxHistoryVersionsHold: number, onLoadHistory: LoadChangesHistoryAction);
	}

	//declarations/tracker/TrackerSqlBuilder.d.ts
	export interface TrackerSqlBuilder {
	    buildChangeSqls(): SqlAndParameters[];
	    buildRollbackChangeSqls(historyVersion: number): Promise<SqlAndParameters[]>;
	}
	export class BasicTrackerSqlBuilder implements TrackerSqlBuilder {
	    constructor(tracker: BasicEntityTracker, schemas: Map<string, ModelSchema<Entity>>, sqlBuilder: SqlBuilder);
	    readonly entityTracker: BasicEntityTracker;
	    buildChangeSqls(): SqlAndParameters[];
	    buildRollbackChangeSqls(historyVersion: number): Promise<SqlAndParameters[]>;
	}

}