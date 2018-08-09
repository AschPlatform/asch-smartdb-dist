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
	}
	export class DbSession {
	    constructor(connection: DbConnection, onLoadHistory: Nullable<LoadChangesHistoryAction>, sessionOptions: DbSessionOptions);
	    readonly isOpen: boolean;
	    syncSchema<E extends object>(schema: ModelSchema<E>): void;
	    updateSchema<E extends object>(schema: ModelSchema<E>): Promise<void>;
	    registerSchema(...schemas: ModelSchema<Entity>[]): void;
	    initSerial(serial: number): Promise<void>;
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
	    getCachedEntity<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): MaybeUndefined<E>;
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
	    maxCached?: number;
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
	    readonly maxCached: MaybeUndefined<number>;
	    readonly modelName: string;
	    readonly isLocal: boolean;
	    readonly isReadonly: boolean;
	    readonly memCached: boolean;
	    hasUniqueProperty(...properties: string[]): boolean;
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
	     * cached last block count
	     * @default 10
	     */
	    cachedBlockCount?: number;
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
	     * update schema, NOTIC : table must be empty !!!
	     * @param schema schema
	     */
	    updateSchema(schema: ModelSchema<Entity>): Promise<void>;
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
	     * @throws lock faild if lockName exists already and notThrow is false
	     */
	    lockInCurrentBlock(lockName: string, notThrow?: boolean): boolean;
	    /**
	   * hold a lock name which only succeed in first time of each block.
	   * @param lockName lock name
	   * @throws lock faild if lockName exists already
	   */
	    lock(lockName: string): void;
	    /**
	   * hold a lock name which only succeed in first time of each block.
	   * @param lockName lock name
	   * @returns true if lock succeed else false
	   */
	    tryLock(lockName: string): boolean;
	    /**
	     * begin a contract transaction which effect entities in memory
	     */
	    beginContract(): void;
	    /**
	     * commit entities changes , these changes will be save into database when block forged
	     */
	    commitContract(): void;
	    /**
	     * rollback entities changes in memory
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
	export class PerformanceHelper {
	    readonly time: (name: string) => void;
	    readonly endTime: (refreshUptime?: boolean) => void;
	    readonly restartTime: (name: string) => void;
	    enabled: boolean;
	}
	export class Utils {
	    static readonly Array: {
	        chunk: any;
	        compact: any;
	        concat: any;
	        difference: any;
	        differenceBy: any;
	        differenceWith: any;
	        drop: any;
	        dropRight: any;
	        dropRightWhile: any;
	        dropWhile: any;
	        fill: any;
	        findIndex: any;
	        findLastIndex: any;
	        first: any;
	        head: any;
	        flatten: any;
	        flattenDeep: any;
	        flattenDepth: any;
	        fromPairs: any;
	        indexOf: any;
	        initial: any;
	        intersection: any;
	        intersectionBy: any;
	        intersectionWith: any;
	        join: any;
	        last: any;
	        lastIndexOf: any;
	        nth: any;
	        pull: any;
	        pullAll: any;
	        pullAllBy: any;
	        pullAllWith: any;
	        pullAt: any;
	        remove: any;
	        reverse: any;
	        slice: any;
	        sortedIndex: any;
	        sortedIndexBy: any;
	        sortedIndexOf: any;
	        sortedLastIndex: any;
	        sortedLastIndexBy: any;
	        sortedLastIndexOf: any;
	        sortedUniq: any;
	        sortedUniqBy: any;
	        tail: any;
	        take: any;
	        takeRight: any;
	        takeRightWhile: any;
	        takeWhile: any;
	        union: any;
	        unionBy: any;
	        unionWith: any;
	        uniq: any;
	        uniqBy: any;
	        uniqWith: any;
	        unzip: any;
	        unzipWith: any;
	        without: any;
	        xor: any;
	        xorBy: any;
	        xorWith: any;
	        zip: any;
	        zipObject: any;
	        zipObjectDeep: any;
	        zipWith: any;
	    };
	    static readonly String: {
	        camelCase: any;
	        capitalize: any;
	        deburr: any;
	        endsWith: any;
	        escape: any;
	        escapeRegExp: any;
	        kebabCase: any;
	        lowerCase: any;
	        lowerFirst: any;
	        pad: any;
	        padEnd: any;
	        padStart: any;
	        parseInt: any;
	        repeat: any;
	        replace: any;
	        snakeCase: any;
	        split: any;
	        startCase: any;
	        startsWith: any;
	        template: any;
	        toLower: any;
	        toUpper: any;
	        trim: any;
	        trimEnd: any;
	        trimStart: any;
	        truncate: any;
	        unescape: any;
	        upperCase: any;
	        upperFirst: any;
	        words: any;
	    };
	    static readonly Collection: {
	        countBy: any;
	        each: any;
	        eachRight: any;
	        every: any;
	        filter: any;
	        find: any;
	        findLast: any;
	        flatMap: any;
	        flatMapDeep: any;
	        flatMapDepth: any;
	        forEach: any;
	        forEachRight: any;
	        groupBy: any;
	        includes: any;
	        invokeMap: any;
	        keyBy: any;
	        map: any;
	        orderBy: any;
	        partition: any;
	        reduce: any;
	        reduceRight: any;
	        reject: any;
	        sample: any;
	        sampleSize: any;
	        shuffle: any;
	        size: any;
	        some: any;
	        sortBy: any;
	    };
	    static readonly Function: {
	        after: any;
	        ary: any;
	        before: any;
	        bind: any;
	        bindKey: any;
	        curry: any;
	        curryRight: any;
	        debounce: any;
	        defer: any;
	        delay: any;
	        flip: any;
	        memoize: any;
	        negate: any;
	        once: any;
	        overArgs: any;
	        partial: any;
	        partialRight: any;
	        rearg: any;
	        rest: any;
	        spread: any;
	        throttle: any;
	        unary: any;
	        wrap: any;
	    };
	    static readonly Object: {
	        assign: any;
	        assignIn: any;
	        assignInWith: any;
	        assignWith: any;
	        at: any;
	        create: any;
	        defaults: any;
	        defaultsDeep: any;
	        entries: any;
	        entriesIn: any;
	        extend: any;
	        findKey: any;
	        findLastKey: any;
	        forIn: any;
	        forInRight: any;
	        forOwn: any;
	        forOwnRight: any;
	        functions: any;
	        functionsIn: any;
	        get: any;
	        has: any;
	        hasIn: any;
	        invert: any;
	        invertBy: any;
	        invoke: any;
	        keys: any;
	        keysIn: any;
	        mapKeys: any;
	        mapValues: any;
	        merge: any;
	        mergeWith: any;
	        omit: any;
	        omitBy: any;
	        pick: any;
	        pickBy: any;
	        result: any;
	        set: any;
	        setWith: any;
	        toPairs: any;
	        toPairsIn: any;
	        transform: any;
	        unset: any;
	        update: any;
	        updateWith: any;
	        values: any;
	        valuesIn: any;
	    };
	    static readonly Lang: {
	        castArray: any;
	        clone: any;
	        cloneDeep: any;
	        cloneDeepWith: any;
	        cloneWith: any;
	        conformsTo: any;
	        eq: any;
	        gt: any;
	        gte: any;
	        isArguments: any;
	        isArray: any;
	        isArrayBuffer: any;
	        isArrayLike: any;
	        isArrayLikeObject: any;
	        isBoolean: any;
	        isBuffer: any;
	        isDate: any;
	        isElement: any;
	        isEmpty: any;
	        isEqual: any;
	        isEqualWith: any;
	        isError: any;
	        isFinite: any;
	        isFunction: any;
	        isInteger: any;
	        isLength: any;
	        isMap: any;
	        isMatch: any;
	        isMatchWith: any;
	        isNaN: any;
	        isNative: any;
	        isNil: any;
	        isNull: any;
	        isNumber: any;
	        isObject: any;
	        isObjectLike: any;
	        isPlainObject: any;
	        isRegExp: any;
	        isSafeInteger: any;
	        isSet: any;
	        isString: any;
	        isSymbol: any;
	        isTypedArray: any;
	        isUndefined: any;
	        isWeakMap: any;
	        isWeakSet: any;
	        lt: any;
	        lte: any;
	        toArray: any;
	        toFinite: any;
	        toInteger: any;
	        toLength: any;
	        toNumber: any;
	        toPlainObject: any;
	        toSafeInteger: any;
	        toString: any;
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
	    get<E extends object>(modelName: string, key: NormalizedEntityKey<E>): MaybeUndefined<E>;
	    getUnique<E extends object>(modelName: string, uniqueName: string, uniqueKey: UniqueKey<E>): MaybeUndefined<E>;
	    existsUnique<E extends object>(modelName: string, uniqueName: string, uniqueKey: UniqueKey<E>): boolean;
	    getAll<E extends object>(modelName: string, filter?: FilterFunction<E>): MaybeUndefined<E[]>;
	    put<E extends object>(modelName: string, key: NormalizedEntityKey<E>, entity: E): void;
	    evit<E extends object>(modelName: string, key: NormalizedEntityKey<E>): void;
	    exists<E extends object>(modelName: string, key: NormalizedEntityKey<E>): boolean;
	    existsModel(modelName: string): boolean;
	    refreshCached<E extends object>(modelName: string, key: NormalizedEntityKey<E>, modifier: PropertyValue<E>[]): boolean;
	}
	export class UniquedEntityCache implements EntityCache {
	    constructor(log: Logger, schemas: Map<string, ModelSchema<Entity>>);
	    registerModel<E extends object>(schema: ModelSchema<E>, uniqueIndexes: ModelIndex<E>[]): void;
	    unRegisterModel(modelName: string): void;
	    clear(modelName?: string): void;
	    readonly models: ModelSchema<Entity>[];
	    get<E extends object>(modelName: string, key: NormalizedEntityKey<E>): MaybeUndefined<E>;
	    getUnique<E extends object>(modelName: string, uniqueName: string, uniqueKey: UniqueKey<E>): MaybeUndefined<E>;
	    existsUnique<E extends object>(modelName: string, uniqueName: string, uniqueKey: UniqueKey<E>): boolean;
	    refreshCached<E extends object>(modelName: string, key: NormalizedEntityKey<E>, modifier: PropertyValue<E>[]): boolean;
	    getAll<E extends object>(modelName: string, filter?: FilterFunction<E>): MaybeUndefined<E[]>;
	    put<E extends object>(modelName: string, key: NormalizedEntityKey<E>, entity: Entity): void;
	    evit<E extends object>(modelName: string, key: NormalizedEntityKey<E>): void;
	    exists<E extends object>(modelName: string, key: NormalizedEntityKey<E>): boolean;
	    existsModel(modelName: string): boolean;
	    dumpCache(): string;
	}

	//declarations/cache/LRUEntityCache.d.ts
	export class LRUEntityCache extends UniquedEntityCache {
	    constructor(schemas: Map<string, ModelSchema<Entity>>);
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
	    buildDropSchema<E extends object>(schema: ModelSchema<E>): string;
	    buildSchema<E extends object>(schema: ModelSchema<E>): string[];
	    buildInsert<E extends object>(schema: ModelSchema<E>, fieldValues: JsonObject): SqlAndParameters;
	    buildDelete<E extends object>(schema: ModelSchema<E>, key: PrimaryKey<E>): SqlAndParameters;
	    buildUpdate<E extends object>(schema: ModelSchema<E>, key: PrimaryKey<E>, fieldValues: JsonObject, version: number): SqlAndParameters;
	    buildSelect<E extends object>(schema: ModelSchema<E>, params: JsonObject): SqlAndParameters;
	    buildSelect<E extends object>(schema: ModelSchema<E>, fields: string[], where: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, join?: JsonObject): SqlAndParameters;
	}
	export class JsonSqlBuilder implements SqlBuilder {
	    buildDropSchema<E extends object>(schema: ModelSchema<E>): string;
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
	export type Stack<T> = Array<T>;
	export const Stack: ArrayConstructor;
	export class BasicEntityTracker implements EntityTracker {
	    initVersion(version: number): Promise<void>;
	    makeModelAndKey<E extends object>(schema: ModelSchema<E>, key: PrimaryKey<E>): ModelAndKey;
	    splitModelAndKey<E extends object>(modelAndKey: ModelAndKey): {
	        model: string;
	        key: PrimaryKey<E>;
	    };
	    readonly trackingEntities: Iterable<TrackingEntity<Entity>>;
	    isTracking<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): boolean;
	    getConfimedChanges(): EntityChanges<Entity>[];
	    trackNew<E extends object>(schema: ModelSchema<E>, entity: E): TrackingEntity<E>;
	    trackPersistent<E extends object>(schema: ModelSchema<E>, entity: Versioned<E>): TrackingEntity<E>;
	    trackDelete<E extends object>(schema: ModelSchema<E>, te: TrackingEntity<E>): void;
	    trackModify<E extends object>(schema: ModelSchema<E>, te: TrackingEntity<E>, modifier: Partial<E>): void;
	    getTrackingEntity<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): MaybeUndefined<TrackingEntity<E>>;
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
	    getChangesUntil(historyVersion: number): Promise<Stack<EntityChanges<Entity>>>;
	}

	//declarations/tracker/EntityStateManager.d.ts


	//declarations/tracker/EntityTracker.d.ts
	export enum EntityState {
	    Transient = -1,
	    Persistent = 0,
	    New = 1,
	    Modified = 2,
	    Deleted = 3,
	}
	export const ENTITY_VERSION_PROPERTY = "_version_";
	export const ENTITY_EXTENSION_SYMBOL = "__extension__";
	export type Versioned<E extends object> = Minix<E, {
	    '_version_': number;
	}>;
	/******************************/
	/******************************/
	export enum EntityChangeType {
	    New = 1,
	    Modify = 2,
	    Delete = 3,
	}
	export interface PropertyChange<E extends object> {
	    name: string & ((keyof E) | '_version_');
	    original?: any;
	    current?: any;
	}
	export interface PropertyValue<E extends object> {
	    name: Property<E>;
	    value: any;
	}
	export interface EntityChanges<E extends object> {
	    type: EntityChangeType;
	    dbVersion: number;
	    model: string;
	    primaryKey: NormalizedEntityKey<E>;
	    propertyChanges: PropertyChange<E>[];
	}
	export type ModelAndKey = string;
	export type ChangesHistoryItem<E extends object> = EntityChanges<E>;
	export type TrackingEntityChangesItem<E extends object> = EntityChanges<E>;
	export type TrackingEntity<E extends object> = Versioned<E>;
	export interface EntityTracker {
	    trackNew<E extends object>(schema: ModelSchema<E>, entity: E): TrackingEntity<E>;
	    trackPersistent<E extends object>(schema: ModelSchema<E>, entityWithVersion: Versioned<E>): TrackingEntity<E>;
	    trackModify<E extends object>(schema: ModelSchema<E>, te: TrackingEntity<E>, modifier: Partial<E>): void;
	    trackDelete<E extends object>(schema: ModelSchema<E>, te: TrackingEntity<E>): void;
	    acceptChanges(historyVersion: number): void;
	    rejectChanges(): void;
	    rollbackChanges(historyVersion: number): Promise<void>;
	    getConfimedChanges(): EntityChanges<Entity>[];
	    isTracking<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): boolean;
	    getTrackingEntity<E extends object>(schema: ModelSchema<E>, key: EntityKey<E>): MaybeUndefined<TrackingEntity<E>>;
	    isConfirming: boolean;
	    beginConfirm(): void;
	    confirm(): void;
	    cancelConfirm(): void;
	}

	//declarations/tracker/SnapshotEntityTracker.d.ts
	export class SnapshotEntityTracker extends BasicEntityTracker implements EntityTracker {
	    constructor(cache: EntityCache, schemas: Map<string, ModelSchema<Entity>>, maxHistoryVersionsHold: number, onLoadHistory: Nullable<LoadChangesHistoryAction>);
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