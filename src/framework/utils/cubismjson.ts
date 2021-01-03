/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as csmstring } from '../type/csmstring';
import { Live2DCubismFramework as csmmap } from '../type/csmmap';
import { Live2DCubismFramework as csmvector } from '../type/csmvector';
import { CubismLogInfo } from './cubismdebug';
import { strtod } from '../live2dcubismframework';
import csmVector = csmvector.csmVector;
import csmVector_iterator = csmvector.iterator;
import csmMap = csmmap.csmMap;
import csmMap_iterator = csmmap.iterator;
import csmString = csmstring.csmString;

export namespace Live2DCubismFramework {
  // 使用StaticInitializeNotForClientCall（）初始化
  const CSM_JSON_ERROR_TYPE_MISMATCH: string = 'Error: type mismatch';
  const CSM_JSON_ERROR_INDEX_OF_BOUNDS: string = 'Error: index out of bounds';


  /**
   * 已解析的JSON元素元素的基类。
   */
  export abstract class Value {

    public static errorValue: Value;   // 作为临时返回值返回的错误。 在CubismFramework :: Dispose之前不要删除
    public static nullValue: Value;    // NULL作为临时返回值返回。  在CubismFramework :: Dispose之前不要删除
    /**
     * 初始化方法
     */
    public static staticInitializeNotForClientCall(): void {
      JsonBoolean.trueValue = new JsonBoolean(true);
      JsonBoolean.falseValue = new JsonBoolean(false);

      JsonError.errorValue = new JsonError('ERROR', true);
      this.nullValue = new JsonNullvalue();

      Value.s_dummyKeys = new csmVector<string>();
    }

    /**
     * 发布方式
     */
    public static staticReleaseNotForClientCall(): void {
      JsonBoolean.trueValue = null as any;
      JsonBoolean.falseValue = null as any;
      JsonError.errorValue = null as any;
      Value.nullValue = null as any;
      Value.s_dummyKeys = null as any;

      JsonBoolean.trueValue = null as any;
      JsonBoolean.falseValue = null as any;
      JsonError.errorValue = null as any;
      Value.nullValue = null as any;
      Value.s_dummyKeys = null as any;
    }

    private static s_dummyKeys: csmVector<string>; // 虚拟钥匙

    protected _stringBuffer: string = undefined as any; // 字符串缓冲区
    /**
     * 构造函数
     */
    public constructor() {

    }

    /**
     * 以字符串形式返回元素(csmString型)
     */
    public abstract getString(defaultValue?: string, indent?: string): string;

    /**
     * 以字符串形式返回元素(string)
     */
    public getRawString(defaultValue?: string, indent?: string): string {
      return this.getString(defaultValue, indent);
    }

    /**
     * 以数字类型返回元素(number)
     */
    public toInt(defaultValue: number = 0): number {
      return defaultValue;
    }

    /**
     * 以数字类型返回元素(number)
     */
    public toFloat(defaultValue: number = 0): number {
      return defaultValue;
    }

    /**
     * 以布尔值的形式返回元素(boolean)
     */
    public toBoolean(defaultValue: boolean = false): boolean {
      return defaultValue;
    }

    /**
     * 返回大小
     */
    public getSize(): number {
      return 0;
    }

    /**
     * 返回元素数组(Value[])
     */
    public getArray(defaultValue: Value[] = null as any): Value[] {
      return defaultValue;
    }

    /**
     * 返回容器中的元素(array)
     */
    public getVector(defaultValue?: csmVector<Value>): csmVector<Value> {
      return defaultValue as any;
    }

    /**
     * 将元素作为map返回(csmMap<csmString, Value>)
     */
    public getMap(defaultValue?: csmMap<string, Value>): csmMap<string, Value> {
      return defaultValue as any;
    }

    /**
     * getValueByIndex[index]
     */
    public getValueByIndex(index: number): Value {
      return Value.errorValue.setErrorNotForClientCall(CSM_JSON_ERROR_TYPE_MISMATCH);
    }

    /**
     * getValueByString[string | csmString]
     */
    public getValueByString(s: string | csmString): Value {
      return Value.nullValue.setErrorNotForClientCall(CSM_JSON_ERROR_TYPE_MISMATCH);
    }

    /**
     * 返回容器中的映射键列表
     *
     * @return 键列表
     */
    public getKeys(): csmVector<string> {
      return Value.s_dummyKeys;
    }

    /**
     * 如果值类型是错误值，则为True
     */
    public isError(): boolean {
      return false;
    }

    /**
     * Valueの種類がnullならtrue
     */
    public isNull(): boolean {
      return false;
    }

    /**
     * Valueの種類が真偽値ならtrue
     */
    public isBool(): boolean {
      return false;
    }

    /**
     * Valueの種類が数値型ならtrue
     */
    public isFloat(): boolean {
      return false;
    }

    /**
     * Valueの種類が文字列ならtrue
     */
    public isString(): boolean {
      return false;
    }

    /**
     * Valueの種類が配列ならtrue
     */
    public isArray(): boolean {
      return false;
    }

    /**
     * Valueの種類がマップ型ならtrue
     */
    public isMap(): boolean {
      return false;
    }

    /**
     * 如果参数的值相等，则为True
     */
    public equals(value: csmString): boolean;
    public equals(value: string): boolean;
    public equals(value: number): boolean;
    public equals(value: boolean): boolean;
    public equals(value: any): boolean {
      return false;
    }

    /**
     * 如果值的值为静态，则为true，如果为静态，则不释放
     */
    public isStatic(): boolean {
      return false;
    }

    /**
     * 将错误值设置为Value
     */
    public setErrorNotForClientCall(errorStr: string): Value {
      return JsonError.errorValue;
    }
  }

  /**
   * 最小的轻量级JSON解析器，仅支持Ascii字符。
   * 规范是JSON的子集。
   * 用于加载配置文件（model3.json）
   *
   * [不支持的项目]
   * ・非ASCII字符，如日语
   * ・e的指数表达式
   */
  export class CubismJson {


    /**
     * 直接从字节数据加载并解析
     *
     * @param buffer
     * @param size
     * @return CubismJson类的一个实例。 失败时为NULL
     */
    public static create(buffer: ArrayBuffer, size: number) {
      const json = new CubismJson();
      const succeeded: boolean = json.parseBytes(buffer, size);

      if (!succeeded) {
        CubismJson.delete(json);
        return null;
      } else {
        return json;
      }
    }

    /**
     * 释放已解析的JSON对象的处理
     *
     * @param instance CubismJson类的实例
     */
    public static delete(instance: CubismJson) {
      instance = null as any;
    }

    public _error: string;     // 解析错误
    public _lineCount: number; // 用于错误报告的行数
    public _root: Value;       // 解析的根元素
    /**
     * 构造函数
     */
    public constructor(buffer?: ArrayBuffer, length?: number) {
      this._error = null as any;
      this._lineCount = 0;
      this._root = null as any;

      if (buffer != undefined) {
        this.parseBytes(buffer, length as any);
      }
    }

    /**
     * 返回已解析的JSON的根元素
     */
    public getRoot(): Value {
      return this._root;
    }

    /**
     *  将Unicode二进制转换为String
     *
     * @param buffer 要转换的二进制数据
     * @return 转换后的字符串
     */
    public arrayBufferToString(buffer: ArrayBuffer): string {
      const uint8Array: Uint8Array = new Uint8Array(buffer);
      let str: string = '';

      for (let i: number = 0, len: number = uint8Array.length; i < len; ++i) {
        str += ('%' + this.pad(uint8Array[i].toString(16)));
      }

      str = decodeURIComponent(str);
      return str;
    }

    /**
     * 执行JSON解析
     * @param buffer    要解析的数据字节
     * @param size      数据字节大小
     * return true : 成功
     * return false: 失敗
     */
    public parseBytes(buffer: ArrayBuffer, size: number): boolean {
      const endPos: number[] = new Array(1); // 要通过引用传递的数组
      const decodeBuffer: string = this.arrayBufferToString(buffer);
      this._root = this.parseValue(decodeBuffer, size, 0, endPos) as any;
      if (this._error) {
        let strbuf: string = '\0';
        strbuf = 'Json parse error : @line ' + (this._lineCount + 1) + '\n';
        this._root = new JsonString(strbuf);

        CubismLogInfo('{0}', this._root.getRawString());
        return false;
      } else if (this._root == null) {
        this._root = new JsonError(new csmString(this._error), false); // 由于root已释放，因此请单独创建一个错误对象
        return false;
      }
      return true;
    }

    /**
     * 解析时返回错误值
     */
    public getParseError(): string {
      return this._error;
    }

    /**
     * 如果根元素后面的元素是文件的末尾，则返回true
     */
    public checkEndOfFile(): boolean {
      return this._root.getArray()[1].equals('EOF');
    }

    /**
     * 从JSON元素解析值（float，String，Value *，Array，null，true，false）
     * 根据元素格式在内部调用ParseString（），ParseObject（），ParseArray（）
     *
     * @param   buffer      JSON元素缓冲区
     * @param   length      要解析的长度
     * @param   begin       开始解析的位置
     * @param   outEndPos   解析结束时的位置
     * @return      从透视图获得的值对象
     */
    protected parseValue(buffer: string, length: number, begin: number, outEndPos: number[]) {
      if (this._error) { return null; }

      let o: Value = null as any;
      let i: number = begin;
      let f: number;

      for (; i < length; i++) {
        const c: string = buffer[i];
        switch (c) {
          case '-':
          case '.':
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9': {
            const afterString: string[] = new Array(1); // 通过引用传递
            f = strtod(buffer.slice(i), afterString);
            outEndPos[0] = buffer.indexOf(afterString[0]);
            return new JsonFloat(f);
          }
          case '\"':
            return new JsonString(this.parseString(buffer, length, i + 1, outEndPos)); // 从“\”之后的字符
          case '[':
            o = this.parseArray(buffer, length, i + 1, outEndPos);
            return o;
          case '{':
            o = this.parseObject(buffer, length, i + 1, outEndPos);
            return o;
          case 'n': // 不是null
            if (i + 3 < length) {
              o = new JsonNullvalue();    // 能够释放
              outEndPos[0] = i + 4;
            } else {
              this._error = 'parse null';
            }
            return o;
          case 't': // 不是true
            if (i + 3 < length) {
              o = JsonBoolean.trueValue;
              outEndPos[0] = i + 4;
            } else {
              this._error = 'parse true';
            }
            return o;
          case 'f': // 不是false
            if (i + 4 < length) {
              o = JsonBoolean.falseValue;
              outEndPos[0] = i + 5;
            } else {
              this._error = 'illegal \',\' position';
            }
            return o;
          case ',': // Array separator
            this._error = 'illegal \',\' position';
            return null;
          case ']': // 非法}但跳过。 数组的末尾似乎没有必要
            outEndPos[0] = i;  // 重新处理相同的字符
            return null;
          case '\n':
            this._lineCount++;
          case ' ':
          case '\t':
          case '\r':
          default:
            break;
        }
      }

      this._error = 'illegal end of value';
      return null;
    }

    /**
     * 将字符串解析为下一个「"」
     *
     * @param   string  ->  要解析的字符串
     * @param   length  ->  要解析的长度
     * @param   begin   ->  开始解析的位置
     * @param  outEndPos   ->  解析结束时的位置
     * @return      解析句子F字符串元素
     */
    protected parseString(string: string, length: number, begin: number, outEndPos: number[]): string {
      if (this._error) { return null as any; }

      let i = begin;
      let c: string, c2: string;
      const ret: csmString = new csmString('');
      let bufStart: number = begin; // 未在sbuf中注册的角色的起始位置

      for (; i < length; i++) {
        c = string[i];

        switch (c) {
          case '\"': {
            outEndPos[0] = i + 1;  // "之后的下一个角色
            ret.append(string.slice(bufStart), (i - bufStart)); // 注册前一个字符
            return ret.s;
          }
          case '//': {
            i++; // 处理两个字符作为一组

            if (i - 1 > bufStart) {
              ret.append(string.slice(bufStart), (i - bufStart)); // 注册前一个字符
            }
            bufStart = i + 1; // 从逃脱后的角色（2个字符

            if (i < length) {
              c2 = string[i];

              switch (c2) {
                case '\\':
                  ret.expansion(1, '\\');
                  break;
                case '\"':
                  ret.expansion(1, '\"');
                  break;
                case '/':
                  ret.expansion(1, '/');
                  break;
                case 'b':
                  ret.expansion(1, '\b');
                  break;
                case 'f':
                  ret.expansion(1, '\f');
                  break;
                case 'n':
                  ret.expansion(1, '\n');
                  break;
                case 'r':
                  ret.expansion(1, '\r');
                  break;
                case 't':
                  ret.expansion(1, '\t');
                  break;
                case 'u':
                  this._error = 'parse string/unicord escape not supported';
                  break;
                default:
                  break;
              }
            } else {
              this._error = 'parse string/escape error';
            }
          }
          default:
            {
              break;
            }
        }
      }

      this._error = 'parse string/illegal end';
      return null as any;
    }

    /**
     * 解析JSON对象元素并返回Value对象
     *
     * @param buffer    JSONエレメントのバッファ
     * @param length    パースする長さ
     * @param begin     パースを開始する位置
     * @param outEndPos パース終了時の位置
     * @return パースから取得したValueオブジェクト
     */
    protected parseObject(buffer: string, length: number, begin: number, outEndPos: number[]): Value {
      if (this._error) { return null as any; }
      const ret: JsonMap = new JsonMap();

      // Key: Value
      let key: string = '';
      let i: number = begin;
      let c: string = '';
      const localRetEndPos2: number[] = Array(1);
      let ok: boolean = false;

      // , が続く限りループ
      for (; i < length; i++) {
        FOR_LOOP: for (; i < length; i++) {
          c = buffer[i];

          switch (c) {
            case '\"':
              key = this.parseString(buffer, length, i + 1, localRetEndPos2);
              if (this._error) {
                return null as any;
              }

              i = localRetEndPos2[0];
              ok = true;
              break FOR_LOOP; // -- loopから出る
            case '}': // 閉じカッコ
              outEndPos[0] = i + 1;
              return ret; // 空
            case ':':
              this._error = 'illegal \':\' position';
              break;
            case '\n':
              this._lineCount++;
            default:
              break;  // スキップする文字
          }
        }
        if (!ok) {
          this._error = 'key not found';
          return null as any;
        }

        ok = false;

        // : をチェック
        FOR_LOOP2: for (; i < length; i++) {
          c = buffer[i];

          switch (c) {
            case ':':
              ok = true;
              i++;
              break FOR_LOOP2;
            case '}':
              this._error = 'illegal \'}\' position';
              break;
            case '\n': this._lineCount++;
            // case ' ': case '\t' : case '\r':
            default:
              break;  // スキップする文字
          }
        }

        if (!ok) {
          this._error = '\':\' not found';
          return null as any;
        }

        // 値をチェック
        const value: Value = this.parseValue(buffer, length, i, localRetEndPos2) as any;
        if (this._error) {
          return null as any;
        }

        i = localRetEndPos2[0];

        // ret.put(key, value);
        ret.put(key, value);

        FOR_LOOP3: for (; i < length; i++) {
          c = buffer[i];

          switch (c) {
            case ',':
              break FOR_LOOP3;
            case '}':
              outEndPos[0] = i + 1;
              return ret; // 正常終了
            case '\n':
              this._lineCount++;
            default:
              break;  // スキップ
          }
        }
      }

      this._error = 'illegal end of perseObject';
      return null as any;
    }

    /**
     * 将字符串解析为下一个「"」
     * @param buffer    JSONエレメントのバッファ
     * @param length    パースする長さ
     * @param begin     パースを開始する位置
     * @param outEndPos パース終了時の位置
     * @return パースから取得したValueオブジェクト
     */
    protected parseArray(buffer: string, length: number, begin: number, outEndPos: number[]): Value {
      if (this._error) { return null as any; }
      let ret: JsonArray = new JsonArray();

      // key : value
      let i: number = begin;
      let c: string;
      const localRetEndpos2: number[] = new Array(1);

      // , が続く限りループ
      for (; i < length; i++) {
        // : をチェック
        const value: Value = this.parseValue(buffer, length, i, localRetEndpos2) as any;

        if (this._error) {
          return null as any;
        }
        i = localRetEndpos2[0];

        if (value) {
          ret.add(value);
        }

        // FOR_LOOP3:
        // boolean breakflag = false;
        FOR_LOOP: for (; i < length; i++) {
          c = buffer[i];

          switch (c) {
            case ',':
              // breakflag = true;
              // break; // 次のKEY, VAlUEへ
              break FOR_LOOP;
            case ']':
              outEndPos[0] = i + 1;
              return ret; // 終了
            case '\n':
              ++this._lineCount;
            // case ' ': case '\t': case '\r':
            default:
              break; // スキップ
          }
        }
      }

      ret = void 0 as any;
      this._error = 'illegal end of parseObject';
      return null as any;
    }

    /**
     * 编码，填充
     */
    private pad(n: string): string {
      return n.length < 2
        ? '0' + n
        : n;
    }
  }

  /**
   * 将解析的JSON元素视为浮点值
   */
  export class JsonFloat extends Value {

    private _value: number; // JSON元素值
    /**
     * 构造函数
     */
    constructor(v: number) {
      super();

      this._value = v;
    }

    /**
     * 如果值类型是数字，则为True
     */
    public isFloat(): boolean {
      return true;
    }

    /**
     * 以字符串形式返回元素（csmString类型）
     */
    public getString(defaultValue: string, indent: string): string {
      const strbuf: string = '\0';
      this._value = parseFloat(strbuf);
      this._stringBuffer = strbuf;

      return this._stringBuffer;
    }

    /**
     * 以数字类型（number）返回元素
     */
    public toInt(defaultValue: number = 0): number {
      return parseInt(this._value.toString());
    }

    /**
     * 以数字类型（number）返回元素
     */
    public toFloat(defaultValue: number = 0.0): number {
      return this._value;
    }

    /**
     * 如果参数的值相等，则为True
     */
    public equals(value: csmString): boolean;
    public equals(value: string): boolean;
    public equals(value: number): boolean;
    public equals(value: boolean): boolean;
    public equals(value: any): boolean {
      if ('number' === typeof (value)) {
        // int
        if (Math.round(value)) {
          return false;
        } else {
          return value == this._value;
        }
      }
      return false;
    }
  }

  /**
   * 将解析的JSON元素视为布尔值
   */
  export class JsonBoolean extends Value {

    public static trueValue: JsonBoolean;  // true
    public static falseValue: JsonBoolean; // false

    private _boolValue: boolean; // JSON要素の値

    /**
     * 引数付きコンストラクタ
     */
    public constructor(v: boolean) {
      super();

      this._boolValue = v;
    }

    /**
     * Valueの種類が真偽値ならtrue
     */
    public isBool(): boolean {
      return true;
    }

    /**
     * 要素を真偽値で返す(boolean)
     */
    public toBoolean(defaultValue: boolean = false): boolean {
      return this._boolValue;
    }

    /**
     * 要素を文字列で返す(csmString型)
     */
    public getString(defaultValue: string, indent: string): string {
      this._stringBuffer = this._boolValue
        ? 'true'
        : 'false';

      return this._stringBuffer;
    }

    /**
     * 引数の値と等しければtrue
     */
    public equals(value: csmString): boolean;
    public equals(value: string): boolean;
    public equals(value: number): boolean;
    public equals(value: boolean): boolean;
    public equals(value: any): boolean {
      if ('boolean' === typeof (value)) {
        return value == this._boolValue;
      }
      return false;
    }

    /**
     * Valueの値が静的ならtrue, 静的なら解放しない
     */
    public isStatic(): boolean {
      return true;
    }
  }

  /**
   * 将解析的JSON元素视为字符串
   */
  export class JsonString extends Value {
    /**
     * 引数付きコンストラクタ
     */
    public constructor(s: string);
    public constructor(s: csmString)
    public constructor(s: any) {
      super();

      if ('string' === typeof (s)) {
        this._stringBuffer = s;
      }

      if (s instanceof csmString) {
        this._stringBuffer = s.s;
      }
    }

    /**
     * Valueの種類が文字列ならtrue
     */
    public isString(): boolean {
      return true;
    }

    /**
     * 要素を文字列で返す(csmString型)
     */
    public getString(defaultValue: string, indent: string): string {
      return this._stringBuffer;
    }

    /**
     * 引数の値と等しければtrue
     */
    public equals(value: csmString): boolean;
    public equals(value: string): boolean;
    public equals(value: number): boolean;
    public equals(value: boolean): boolean;
    public equals(value: any): boolean {
      if ('string' === typeof (value)) {
        return this._stringBuffer == value;
      }

      if (value instanceof csmString) {
        return (this._stringBuffer == value.s);
      }

      return false;
    }
  }

  /**
   * JSON解析期间的错误结果。 像字符串类型一样
   */
  export class JsonError extends JsonString {


    protected _isStatic: boolean; // 静的なValueかどうか

    /**
     * 引数付きコンストラクタ
     */
    public constructor(s: csmString | string, isStatic: boolean) {
      if ('string' === typeof (s)) {
        super(s);
      } else {
        super(s);
      }
      this._isStatic = isStatic;
    }
    /**
     * Valueの値が静的ならtrue、静的なら解放しない
     */
    public isStatic(): boolean {
      return this._isStatic;
    }

    /**
     * エラー情報をセットする
     */
    public setErrorNotForClientCall(s: string): Value {
      this._stringBuffer = s;
      return this;
    }

    /**
     * Valueの種類がエラー値ならtrue
     */
    public isError(): boolean {
      return true;
    }
  }

  /**
   * 将解析的JSON元素作为空值
   */
  export class JsonNullvalue extends Value {

    /**
     * コンストラクタ
     */
    public constructor() {
      super();

      this._stringBuffer = 'NullValue';
    }
    /**
     * Valueの種類がNULL値ならtrue
     */
    public isNull(): boolean {
      return true;
    }

    /**
     * 要素を文字列で返す(csmString型)
     */
    public getString(defaultValue: string, indent: string): string {
      return this._stringBuffer;
    }

    /**
     * Valueの値が静的ならtrue, 静的なら解放しない
     */
    public isStatic(): boolean {
      return true;
    }

  }

  /**
   * 将解析后的JSON元素作为array
   */
  export class JsonArray extends Value {

    private _array: csmVector<Value>; // JSON要素の値
    /**
     * コンストラクタ
     */
    public constructor() {
      super();
      this._array = new csmVector<Value>();
    }

    /**
     * デストラクタ相当の処理
     */
    public release(): void {
      for (const ite: csmVector_iterator<Value> = this._array.begin(); ite.notEqual(this._array.end()); ite.preIncrement()) {
        let v: Value = ite.ptr();

        if (v && !v.isStatic()) {
          v = void 0 as any;
          v = null as any;
        }
      }
    }

    /**
     * Valueの種類が配列ならtrue
     */
    public isArray(): boolean {
      return true;
    }

    /**
     * 添字演算子[index]
     */
    public getValueByIndex(index: number): Value {
      if (index < 0 || this._array.getSize() <= index) {
        return Value.errorValue.setErrorNotForClientCall(CSM_JSON_ERROR_INDEX_OF_BOUNDS);
      }

      const v: Value = this._array.at(index);

      if (v == null) {
        return Value.nullValue;
      }

      return v;
    }

    /**
     * 添字演算子[string | csmString]
     */
    public getValueByString(s: string | csmString): Value {
      return Value.errorValue.setErrorNotForClientCall(CSM_JSON_ERROR_TYPE_MISMATCH);
    }

    /**
     * 要素を文字列で返す(csmString型)
     */
    public getString(defaultValue: string, indent: string): string {
      const stringBuffer: string = indent + '[\n';

      for (const ite: csmVector_iterator<Value> = this._array.begin(); ite.notEqual(this._array.end()); ite.increment()) {
        const v: Value = ite.ptr();
        this._stringBuffer += indent + '' + v.getString(indent + ' ') + '\n';
      }

      this._stringBuffer = stringBuffer + indent + ']\n';

      return this._stringBuffer;
    }

    /**
     * 配列要素を追加する
     * @param v 追加する要素
     */
    public add(v: Value): void {
      this._array.pushBack(v);
    }

    /**
     * 要素をコンテナで返す(csmVector<Value>)
     */
    public getVector(defaultValue: csmVector<Value> = null as any): csmVector<Value> {
      return this._array;
    }

    /**
     * 要素の数を返す
     */
    public getSize(): number {
      return this._array.getSize();
    }
  }

  /**
   * 将解析后的JSON元素作为map
   */
  export class JsonMap extends Value {


    private _map: csmMap<string, Value>;   // JSON要素の値
    private _keys: csmVector<string> = undefined as any;               // JSON要素の値
    /**
     * コンストラクタ
     */
    public constructor() {
      super();
      this._map = new csmMap<string, Value>();
    }

    /**
     * デストラクタ相当の処理
     */
    public release(): void {
      const ite: csmMap_iterator<string, Value> = this._map.begin();

      while (ite.notEqual(this._map.end())) {
        let v: Value = ite.ptr().second;

        if (v && !v.isStatic()) {
          v = void 0 as any;
          v = null as any;
        }

        ite.preIncrement();
      }
    }

    /**
     * Valueの値がMap型ならtrue
     */
    public isMap(): boolean {
      return true;
    }

    /**
     * 添字演算子[string | csmString]
     */
    public getValueByString(s: string | csmString): Value {
      if (s instanceof csmString) {
        const ret: Value = this._map.getValue(s.s);
        if (ret == null) {
          return Value.nullValue;
        }
        return ret;
      }

      for (const iter: csmMap_iterator<string, Value> = this._map.begin(); iter.notEqual(this._map.end()); iter.preIncrement()) {
        if (iter.ptr().first == s) {
          if (iter.ptr().second == null) {
            return Value.nullValue;
          }
          return iter.ptr().second;
        }
      }

      return Value.nullValue;
    }

    /**
     * 添字演算子[index]
     */
    public getValueByIndex(index: number): Value {
      return Value.errorValue.setErrorNotForClientCall(CSM_JSON_ERROR_TYPE_MISMATCH);
    }

    /**
     * 要素を文字列で返す(csmString型)
     */
    public getString(defaultValue: string, indent: string) {
      this._stringBuffer = indent + '{\n';

      const ite: csmMap_iterator<string, Value> = this._map.begin();
      while (ite.notEqual(this._map.end())) {
        const key = ite.ptr().first;
        const v: Value = ite.ptr().second;

        this._stringBuffer += indent + ' ' + key + ' : ' + v.getString(indent + '   ') + ' \n';
        ite.preIncrement();
      }

      this._stringBuffer += indent + '}\n';

      return this._stringBuffer;
    }

    /**
     * 要素をMap型で返す
     */
    public getMap(defaultValue?: csmMap<string, Value>): csmMap<string, Value> {
      return this._map;
    }

    /**
     * Mapに要素を追加する
     */
    public put(key: string, v: Value): void {
      this._map.setValue(key, v);
    }

    /**
     * Mapからキーのリストを取得する
     */
    public getKeys(): csmVector<string> {
      if (!this._keys) {
        this._keys = new csmVector<string>();

        const ite: csmMap_iterator<string, Value> = this._map.begin();

        while (ite.notEqual(this._map.end())) {
          const key: string = ite.ptr().first;
          this._keys.pushBack(key);
          ite.preIncrement();
        }
      }
      return this._keys;
    }

    /**
     * Mapの要素数を取得する
     */
    public getSize(): number {
      return this._keys.getSize();
    }
  }
}
