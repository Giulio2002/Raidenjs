(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){}],2:[function(require,module,exports){var asn1=exports;asn1.bignum=require('bn.js');asn1.define=require('./asn1/api').define;asn1.base=require('./asn1/base');asn1.constants=require('./asn1/constants');asn1.decoders=require('./asn1/decoders');asn1.encoders=require('./asn1/encoders')},{"./asn1/api":3,"./asn1/base":5,"./asn1/constants":9,"./asn1/decoders":11,"./asn1/encoders":14,"bn.js":17}],3:[function(require,module,exports){var asn1=require('../asn1');var inherits=require('inherits');var api=exports;api.define=function define(name,body){return new Entity(name,body)};function Entity(name,body){this.name=name;this.body=body};Entity.prototype._createNamed=function createNamed(base){var named;try{named=require('vm').runInThisContext('(function '+this.name+'(entity) {\n'+'  this._initNamed(entity);\n'+'})')}catch(e){named=function(entity){this._initNamed(entity)}}inherits(named,base);named.prototype._initNamed=function initnamed(entity){base.call(this,entity)};return new named(this)};Entity.prototype._getDecoder=function _getDecoder(enc){enc=enc||'der'}},{"../base":5,"minimalistic-assert":107}],7:[function(require,module,exports){var inherits=require('inherits');function Reporter(options){this._reporterState={obj:null,path:[],options:options||{},errors:[]}}
exports.Reporter=Reporter;Reporter.prototype.isError=function isError(obj){return obj instanceof ReporterError};Reporter.prototype.save=function save(){var state=this._reporterState;return{obj:state.obj,pathLen:state.path.length}};Reporter.prototype.restore=function restore(data){var state=this._reporterState;state.obj=data.obj;state.path=state.path.slice(0,data.pathLen)};Reporter.prototype.enterKey=function enterKey(key){return this._reporterState.path.push(key)};Reporter.prototype.exitKey=function exitKey(index){var state=this._reporterState;state.path=state.path.slice(0,index-1)};Reporter.prototype.leaveKey=function leaveKey(index,key,value){var state=this._reporterState;this.exitKey(index);if(state.obj!==null)
state.obj[key]=value};Reporter.prototype.path=function path(){return this._reporterState.path.join('/')};Reporter.prototype.enterObject=function enterObject(){var state=this._reporterState;var prev=state.obj;state.obj={};return prev};Reporter.prototype.leaveObject=function leaveObject(prev){var state=this._reporterState;var now=state.obj;state.obj=prev;return now};Reporter.prototype.error=function error(msg){var err;var state=this._reporterState;var inherited=msg instanceof ReporterError;if(inherited){err=msg}else{err=new ReporterError(state.path.map(function(elem){return'['+JSON.stringify(elem)+']'}).join(''),msg.message||msg,msg.stack)}
if(!state.options.partial)
throw err;if(!inherited)
state.errors.push(err);return err};Reporter.prototype.wrapResult=function wrapResult(result){var state=this._reporterState;if(!state.options.partial)
return result;return{result:this.isError(result)?null:result,errors:state.errors}};function ReporterError(path,msg){this.path=path;this.rethrow(msg)};inherits(ReporterError,Error);ReporterError.prototype.rethrow=function rethrow(msg){this.message=msg+' at:'+(this.path||'(shallow)');if(Error.captureStackTrace)
Error.captureStackTrace(this,ReporterError);if(!this.stack){try{throw new Error(this.message)}catch(e){this.stack=e.stack}}
return this}},{"inherits":102}],8:[function(require,module,exports){var constants=require('../constants');exports.tagClass={0:'universal',1:'application',2:'context',3:'private'};exports.tagClassByName=constants._reverse(exports.tagClass);exports.tag={0x00:'end',0x01:'bool',0x02:'int',0x03:'bitstr',0x04:'octstr',0x05:'null_',0x06:'objid',0x07:'objDesc',0x08:'external',0x09:'real',0x0a:'enum',0x0b:'embed',0x0c:'utf8str',0x0d:'relativeOid',0x10:'seq',0x11:'set',0x12:'numstr',0x13:'printstr',0x14:'t61str',0x15:'videostr',0x16:'ia5str',0x17:'utctime',0x18:'gentime',0x19:'graphstr',0x1a:'iso646str',0x1b:'genstr',0x1c:'unistr',0x1d:'charstr',0x1e:'bmpstr'};exports.tagByName=constants._reverse(exports.tag)},{"../constants":9}],9:[function(require,module,exports){var constants=exports;constants._reverse=function reverse(map){var res={};Object.keys(map).forEach(function(key){if((key|0)==key)
key=key|0;var value=map[key];res[value]=key});return res};constants.der=require('./der')},{"./der":8}],10:[function(require,module,exports){var inherits=require('inherits');var asn1=require('../../asn1');var base=asn1.base;var bignum=asn1.bignum;var der=asn1.constants.der;function DERDecoder(entity){this.enc='der';this.name=entity.name;this.entity=entity;this.tree=new DERNode();this.tree._init(entity.body)};module.exports=DERDecoder;DERDecoder.prototype.decode=function decode(data,options){if(!(data instanceof base.DecoderBuffer))
data=new base.DecoderBuffer(data,options);return this.tree._decode(data,options)};function DERNode(parent){base.Node.call(this,'der',parent)}
inherits(DERNode,base.Node);DERNode.prototype._peekTag=function peekTag(buffer,tag,any){if(buffer.isEmpty())
return!1;var state=buffer.save();var decodedTag=derDecodeTag(buffer,'Failed to peek tag:"'+tag+'"');if(buffer.isError(decodedTag))
return decodedTag;buffer.restore(state);return decodedTag.tag===tag||decodedTag.tagStr===tag||(decodedTag.tagStr+'of')===tag||any};DERNode.prototype._decodeTag=function decodeTag(buffer,tag,any){var decodedTag=derDecodeTag(buffer,'Failed to decode tag of "'+tag+'"');if(buffer.isError(decodedTag))
return decodedTag;var len=derDecodeLen(buffer,decodedTag.primitive,'Failed to get length of "'+tag+'"');if(buffer.isError(len))
return len;if(!any&&decodedTag.tag!==tag&&decodedTag.tagStr!==tag&&decodedTag.tagStr+'of'!==tag){return buffer.error('Failed to match tag:"'+tag+'"')}
if(decodedTag.primitive||len!==null)
return buffer.skip(len,'Failed to match body of:"'+tag+'"');var state=buffer.save();var res=this._skipUntilEnd(buffer,'Failed to skip indefinite length body:"'+this.tag+'"');if(buffer.isError(res))
return res;len=buffer.offset-state.offset;buffer.restore(state);return buffer.skip(len,'Failed to match body of:"'+tag+'"')};DERNode.prototype._skipUntilEnd=function skipUntilEnd(buffer,fail){while(!0){var tag=derDecodeTag(buffer,fail);if(buffer.isError(tag))
return tag;var len=derDecodeLen(buffer,tag.primitive,fail);if(buffer.isError(len))
return len;var res;if(tag.primitive||len!==null)
res=buffer.skip(len)
else res=this._skipUntilEnd(buffer,fail);if(buffer.isError(res))
return res;if(tag.tagStr==='end')
break}};DERNode.prototype._decodeList=function decodeList(buffer,tag,decoder,options){var result=[];while(!buffer.isEmpty()){var possibleEnd=this._peekTag(buffer,'end');if(buffer.isError(possibleEnd))
return possibleEnd;var res=decoder.decode(buffer,'der',options);if(buffer.isError(res)&&possibleEnd)
break;result.push(res)}
return result};DERNode.prototype._decodeStr=function decodeStr(buffer,tag){if(tag==='bitstr'){var unused=buffer.readUInt8();if(buffer.isError(unused))
return unused;return{unused:unused,data:buffer.raw()}}else if(tag==='bmpstr'){var raw=buffer.raw();if(raw.length%2===1)
return buffer.error('Decoding of string type:bmpstr length mismatch');var str='';for(var i=0;i<raw.length/2;i++){str+=String.fromCharCode(raw.readUInt16BE(i*2))}
return str}else if(tag==='numstr'){var numstr=buffer.raw().toString('ascii');if(!this._isNumstr(numstr)){return buffer.error('Decoding of string type:'+'numstr unsupported characters')}
return numstr}else if(tag==='octstr'){return buffer.raw()}else if(tag==='objDesc'){return buffer.raw()}else if(tag==='printstr'){var printstr=buffer.raw().toString('ascii');if(!this._isPrintstr(printstr)){return buffer.error('Decoding of string type:'+'printstr unsupported characters')}
return printstr}else if(/str$/.test(tag)){return buffer.raw().toString()}else{return buffer.error('Decoding of string type:'+tag+' unsupported')}};DERNode.prototype._decodeObjid=function decodeObjid(buffer,values,relative){var result;var identifiers=[];var ident=0;while(!buffer.isEmpty()){var subident=buffer.readUInt8();ident<<=7;ident|=subident&0x7f;if((subident&0x80)===0){identifiers.push(ident);ident=0}}
if(subident&0x80)
identifiers.push(ident);var first=(identifiers[0]/40)|0;var second=identifiers[0]%40;if(relative)
result=identifiers;else result=[first,second].concat(identifiers.slice(1));if(values){var tmp=values[result.join(' ')];if(tmp===undefined)
tmp=values[result.join('.')];if(tmp!==undefined)
result=tmp}
return result};DERNode.prototype._decodeTime=function decodeTime(buffer,tag){var str=buffer.raw().toString();if(tag==='gentime'){var year=str.slice(0,4)|0;var mon=str.slice(4,6)|0;var day=str.slice(6,8)|0;var hour=str.slice(8,10)|0;var min=str.slice(10,12)|0;var sec=str.slice(12,14)|0}else if(tag==='utctime'){var year=str.slice(0,2)|0;var mon=str.slice(2,4)|0;var day=str.slice(4,6)|0;var hour=str.slice(6,8)|0;var min=str.slice(8,10)|0;var sec=str.slice(10,12)|0;if(year<70)
year=2000+year;else year=1900+year}else{return buffer.error('Decoding '+tag+' time is not supported yet')}
return Date.UTC(year,mon-1,day,hour,min,sec,0)};DERNode.prototype._decodeNull=function decodeNull(buffer){return null};DERNode.prototype._decodeBool=function decodeBool(buffer){var res=buffer.readUInt8();if(buffer.isError(res))
return res;else return res!==0};DERNode.prototype._decodeInt=function decodeInt(buffer,values){var raw=buffer.raw();var res=new bignum(raw);if(values)
res=values[res.toString(10)]||res;return res};DERNode.prototype._use=function use(entity,obj){if(typeof entity==='function')
entity=entity(obj);return entity._getDecoder('der').tree};function derDecodeTag(buf,fail){var tag=buf.readUInt8(fail);if(buf.isError(tag))
return tag;var cls=der.tagClass[tag>>6];var primitive=(tag&0x20)===0;if((tag&0x1f)===0x1f){var oct=tag;tag=0;while((oct&0x80)===0x80){oct=buf.readUInt8(fail);if(buf.isError(oct))
return oct;tag<<=7;tag|=oct&0x7f}}else{tag&=0x1f}
var tagStr=der.tag[tag];return{cls:cls,primitive:primitive,tag:tag,tagStr:tagStr}}
function derDecodeLen(buf,primitive,fail){var len=buf.readUInt8(fail);if(buf.isError(len))
return len;if(!primitive&&len===0x80)
return null;if((len&0x80)===0){return len}
var num=len&0x7f;if(num>4)
return buf.error('length octect is too long');len=0;for(var i=0;i<num;i++){len<<=8;var j=buf.readUInt8(fail);if(buf.isError(j))
return j;len|=j}
return len}},{"../../asn1":2,"inherits":102}],11:[function(require,module,exports){var decoders=exports;decoders.der=require('./der');decoders.pem=require('./pem')},{"./der":10,"./pem":12}],12:[function(require,module,exports){var inherits=require('inherits');var Buffer=require('buffer').Buffer;var DERDecoder=require('./der');function PEMDecoder(entity){DERDecoder.call(this,entity);this.enc='pem'};inherits(PEMDecoder,DERDecoder);module.exports=PEMDecoder;PEMDecoder.prototype.decode=function decode(data,options){var lines=data.toString().split(/[\r\n]+/g);var label=options.label.toUpperCase();var re=/^-----(BEGIN|END) ([^-]+)-----$/;var start=-1;var end=-1;for(var i=0;i<lines.length;i++){var match=lines[i].match(re);if(match===null)
continue;if(match[2]!==label)
continue;if(start===-1){if(match[1]!=='BEGIN')
break;start=i}else{if(match[1]!=='END')
break;end=i;break}}
if(start===-1||end===-1)
throw new Error('PEM section not found for:'+label);var base64=lines.slice(start+1,end).join('');base64.replace(/[^a-z0-9\+\/=]+/gi,'');var input=new Buffer(base64,'base64');return DERDecoder.prototype.decode.call(this,input,options)}},{"./der":10,"buffer":48,"inherits":102}],13:[function(require,module,exports){var inherits=require('inherits');var Buffer=require('buffer').Buffer;var asn1=require('../../asn1');var base=asn1.base;var der=asn1.constants.der;function DEREncoder(entity){this.enc='der';this.name=entity.name;this.entity=entity;this.tree=new DERNode();this.tree._init(entity.body)};module.exports=DEREncoder;DEREncoder.prototype.encode=function encode(data,reporter){return this.tree._encode(data,reporter).join()};function DERNode(parent){base.Node.call(this,'der',parent)}
inherits(DERNode,base.Node);DERNode.prototype._encodeComposite=function encodeComposite(tag,primitive,cls,content){var encodedTag=encodeTag(tag,primitive,cls,this.reporter);if(content.length<0x80){var header=new Buffer(2);header[0]=encodedTag;header[1]=content.length;return this._createEncoderBuffer([header,content])}
var lenOctets=1;for(var i=content.length;i>=0x100;i>>=8)
lenOctets++;var header=new Buffer(1+1+lenOctets);header[0]=encodedTag;header[1]=0x80|lenOctets;for(var i=1+lenOctets,j=content.length;j>0;i--,j>>=8)
header[i]=j&0xff;return this._createEncoderBuffer([header,content])};DERNode.prototype._encodeStr=function encodeStr(str,tag){if(tag==='bitstr'){return this._createEncoderBuffer([str.unused|0,str.data])}else if(tag==='bmpstr'){var buf=new Buffer(str.length*2);for(var i=0;i<str.length;i++){buf.writeUInt16BE(str.charCodeAt(i),i*2)}
return this._createEncoderBuffer(buf)}else if(tag==='numstr'){if(!this._isNumstr(str)){return this.reporter.error('Encoding of string type:numstr supports '+'only digits and space')}
return this._createEncoderBuffer(str)}else if(tag==='printstr'){if(!this._isPrintstr(str)){return this.reporter.error('Encoding of string type:printstr supports '+'only latin upper and lower case letters,'+'digits,space,apostrophe,left and rigth '+'parenthesis,plus sign,comma,hyphen,'+'dot,slash,colon,equal sign,'+'question mark')}
return this._createEncoderBuffer(str)}else if(/str$/.test(tag)){return this._createEncoderBuffer(str)}else if(tag==='objDesc'){return this._createEncoderBuffer(str)}else{return this.reporter.error('Encoding of string type:'+tag+' unsupported')}};DERNode.prototype._encodeObjid=function encodeObjid(id,values,relative){if(typeof id==='string'){if(!values)
return this.reporter.error('string objid given,but no values map found');if(!values.hasOwnProperty(id))
return this.reporter.error('objid not found in values map');id=values[id].split(/[\s\.]+/g);for(var i=0;i<id.length;i++)
id[i]|=0}else if(Array.isArray(id)){id=id.slice();for(var i=0;i<id.length;i++)
id[i]|=0}
if(!Array.isArray(id)){return this.reporter.error('objid() should be either array or string,'+'got:'+JSON.stringify(id))}
if(!relative){if(id[1]>=40)
return this.reporter.error('Second objid identifier OOB');id.splice(0,2,id[0]*40+id[1])}
var size=0;for(var i=0;i<id.length;i++){var ident=id[i];for(size++;ident>=0x80;ident>>=7)
size++}
var objid=new Buffer(size);var offset=objid.length-1;for(var i=id.length-1;i>=0;i--){var ident=id[i];objid[offset--]=ident&0x7f;while((ident>>=7)>0)
objid[offset--]=0x80|(ident&0x7f);}
return this._createEncoderBuffer(objid)};function two(num){if(num<10)
return'0'+num;else return num}
DERNode.prototype._encodeTime=function encodeTime(time,tag){var str;var date=new Date(time);if(tag==='gentime'){str=[two(date.getFullYear()),two(date.getUTCMonth()+1),two(date.getUTCDate()),two(date.getUTCHours()),two(date.getUTCMinutes()),two(date.getUTCSeconds()),'Z'].join('')}else if(tag==='utctime'){str=[two(date.getFullYear()%100),two(date.getUTCMonth()+1),two(date.getUTCDate()),two(date.getUTCHours()),two(date.getUTCMinutes()),two(date.getUTCSeconds()),'Z'].join('')}else{this.reporter.error('Encoding '+tag+' time is not supported yet')}
return this._encodeStr(str,'octstr')};DERNode.prototype._encodeNull=function encodeNull(){return this._createEncoderBuffer('')};DERNode.prototype._encodeInt=function encodeInt(num,values){if(typeof num==='string'){if(!values)
return this.reporter.error('String int or enum given,but no values map');if(!values.hasOwnProperty(num)){return this.reporter.error('Values map doesn\'t contain: '+JSON.stringify(num))}num=values[num]}
for(var i=0,len2=len-extraBytes;i<len2;i+=maxChunkLength){parts.push(encodeChunk(uint8,i,(i+maxChunkLength)>len2?len2:(i+maxChunkLength)))}
if(extraBytes===1){tmp=uint8[len-1]
parts.push(lookup[tmp>>2]+lookup[(tmp<<4)&0x3F]+'==')}else if(extraBytes===2){tmp=(uint8[len-2]<<8)+uint8[len-1]
parts.push(lookup[tmp>>10]+lookup[(tmp>>4)&0x3F]+lookup[(tmp<<2)&0x3F]+'=')}
return parts.join('')}},{}],17:[function(require,module,exports){(function(module,exports){'use strict';function assert(val,msg){if(!val)throw new Error(msg||'Assertion failed')}
var a=self.words[0]|0;var b=num.words[0]|0;var r=a*b;var lo=r&0x3ffffff;var carry=(r/0x4000000)|0;out.words[0]=lo;for(var k=1;k<len;k++){var ncarry=carry>>>26;var rword=carry&0x3ffffff;var maxJ=Math.min(k,num.length-1);for(var j=Math.max(0,k-self.length+1);j<=maxJ;j++){var i=(k-j)|0;a=self.words[i]|0;b=num.words[j]|0;r=a*b+rword;ncarry+=(r/0x4000000)|0;rword=r&0x3ffffff}
out.words[k]=rword|0;carry=ncarry|0}
if(carry!==0){out.words[k]=carry|0}else{out.length--}
return out.strip()}}else if(typeof window==='object'){Rand.prototype._rand=function(){throw new Error('Not implemented yet')}}}else{try{var crypto=require('crypto');if(typeof crypto.randomBytes!=='function')
throw new Error('Not supported');Rand.prototype._rand=function _rand(n){return crypto.randomBytes(n)}}catch(e){}}},{"crypto":19}],19:[function(require,module,exports){arguments[4][1][0].apply(exports,arguments)},{"dup":1}],20:[function(require,module,exports){var Buffer=require('safe-buffer').Buffer
function asUInt32Array(buf){if(!Buffer.isBuffer(buf))buf=Buffer.from(buf)
var len=(buf.length/4)|0
var out=new Array(len)
for(var i=0;i<len;i++){out[i]=buf.readUInt32BE(i*4)}
return out}
function scrubVec(v){for(var i=0;i<v.length;v++){v[i]=0}}
function cryptBlock(M,keySchedule,SUB_MIX,SBOX,nRounds){var SUB_MIX0=SUB_MIX[0]
var SUB_MIX1=SUB_MIX[1]
var SUB_MIX2=SUB_MIX[2]
var SUB_MIX3=SUB_MIX[3]
var s0=M[0]^keySchedule[0]
var s1=M[1]^keySchedule[1]
var s2=M[2]^keySchedule[2]
var s3=M[3]^keySchedule[3]
var t0,t1,t2,t3
var ksRow=4
for(var round=1;round<nRounds;round++){t0=SUB_MIX0[s0>>>24]^SUB_MIX1[(s1>>>16)&0xff]^SUB_MIX2[(s2>>>8)&0xff]^SUB_MIX3[s3&0xff]^keySchedule[ksRow++]
t1=SUB_MIX0[s1>>>24]^SUB_MIX1[(s2>>>16)&0xff]^SUB_MIX2[(s3>>>8)&0xff]^SUB_MIX3[s0&0xff]^keySchedule[ksRow++]
t2=SUB_MIX0[s2>>>24]^SUB_MIX1[(s3>>>16)&0xff]^SUB_MIX2[(s0>>>8)&0xff]^SUB_MIX3[s1&0xff]^keySchedule[ksRow++]
t3=SUB_MIX0[s3>>>24]^SUB_MIX1[(s0>>>16)&0xff]^SUB_MIX2[(s1>>>8)&0xff]^SUB_MIX3[s2&0xff]^keySchedule[ksRow++]
s0=t0
s1=t1
s2=t2
s3=t3}
t0=((SBOX[s0>>>24]<<24)|(SBOX[(s1>>>16)&0xff]<<16)|(SBOX[(s2>>>8)&0xff]<<8)|SBOX[s3&0xff])^keySchedule[ksRow++]
t1=((SBOX[s1>>>24]<<24)|(SBOX[(s2>>>16)&0xff]<<16)|(SBOX[(s3>>>8)&0xff]<<8)|SBOX[s0&0xff])^keySchedule[ksRow++]
t2=((SBOX[s2>>>24]<<24)|(SBOX[(s3>>>16)&0xff]<<16)|(SBOX[(s0>>>8)&0xff]<<8)|SBOX[s1&0xff])^keySchedule[ksRow++]
t3=((SBOX[s3>>>24]<<24)|(SBOX[(s0>>>16)&0xff]<<16)|(SBOX[(s1>>>8)&0xff]<<8)|SBOX[s2&0xff])^keySchedule[ksRow++]
t0=t0>>>0
t1=t1>>>0
t2=t2>>>0
t3=t3>>>0
return[t0,t1,t2,t3]}
var RCON=[0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36]
var G=(function(){var d=new Array(256)
for(var j=0;j<256;j++){if(j<128){d[j]=j<<1}else{d[j]=(j<<1)^0x11b}}
var SBOX=[]
var INV_SBOX=[]
var SUB_MIX=[[],[],[],[]]
var INV_SUB_MIX=[[],[],[],[]]
var x=0
var xi=0
for(var i=0;i<256;++i){var sx=xi^(xi<<1)^(xi<<2)^(xi<<3)^(xi<<4)
sx=(sx>>>8)^(sx&0xff)^0x63
SBOX[x]=sx
INV_SBOX[sx]=x
var x2=d[x]
var x4=d[x2]
var x8=d[x4]
var t=(d[sx]*0x101)^(sx*0x1010100)
SUB_MIX[0][x]=(t<<24)|(t>>>8)
SUB_MIX[1][x]=(t<<16)|(t>>>16)
SUB_MIX[2][x]=(t<<8)|(t>>>24)
SUB_MIX[3][x]=t
t=(x8*0x1010101)^(x4*0x10001)^(x2*0x101)^(x*0x1010100)
INV_SUB_MIX[0][sx]=(t<<24)|(t>>>8)
INV_SUB_MIX[1][sx]=(t<<16)|(t>>>16)
INV_SUB_MIX[2][sx]=(t<<8)|(t>>>24)
INV_SUB_MIX[3][sx]=t
if(x===0){x=xi=1}else{x=x2^d[d[d[x8^x2]]]
xi^=d[d[xi]]}}
return{SBOX:SBOX,INV_SBOX:INV_SBOX,SUB_MIX:SUB_MIX,INV_SUB_MIX:INV_SUB_MIX}})()
function AES(key){this._key=asUInt32Array(key)
this._reset()}
AES.blockSize=4*4
AES.keySize=256/8
AES.prototype.blockSize=AES.blockSize
AES.prototype.keySize=AES.keySize
AES.prototype._reset=function(){var keyWords=this._key
var keySize=keyWords.length
var nRounds=keySize+6
var ksRows=(nRounds+1)*4
var keySchedule=[]
for(var k=0;k<keySize;k++){keySchedule[k]=keyWords[k]}
for(k=keySize;k<ksRows;k++){var t=keySchedule[k-1]
if(k%keySize===0){t=(t<<8)|(t>>>24)
t=(G.SBOX[t>>>24]<<24)|(G.SBOX[(t>>>16)&0xff]<<16)|(G.SBOX[(t>>>8)&0xff]<<8)|(G.SBOX[t&0xff])
t^=RCON[(k/keySize)|0]<<24}else if(keySize>6&&k%keySize===4){t=(G.SBOX[t>>>24]<<24)|(G.SBOX[(t>>>16)&0xff]<<16)|(G.SBOX[(t>>>8)&0xff]<<8)|(G.SBOX[t&0xff])}
keySchedule[k]=keySchedule[k-keySize]^t}
var invKeySchedule=[]
for(var ik=0;ik<ksRows;ik++){var ksR=ksRows-ik
var tt=keySchedule[ksR-(ik%4?0:4)]
if(ik<4||ksR<=4){invKeySchedule[ik]=tt}else{invKeySchedule[ik]=G.INV_SUB_MIX[0][G.SBOX[tt>>>24]]^G.INV_SUB_MIX[1][G.SBOX[(tt>>>16)&0xff]]^G.INV_SUB_MIX[2][G.SBOX[(tt>>>8)&0xff]]^G.INV_SUB_MIX[3][G.SBOX[tt&0xff]]}}
this._nRounds=nRounds
this._keySchedule=keySchedule
this._invKeySchedule=invKeySchedule}
AES.prototype.encryptBlockRaw=function(M){M=asUInt32Array(M)
return cryptBlock(M,this._keySchedule,G.SUB_MIX,G.SBOX,this._nRounds)}
AES.prototype.encryptBlock=function(M){var out=this.encryptBlockRaw(M)
var buf=Buffer.allocUnsafe(16)
buf.writeUInt32BE(out[0],0)
buf.writeUInt32BE(out[1],4)
buf.writeUInt32BE(out[2],8)
buf.writeUInt32BE(out[3],12)
return buf}
AES.prototype.decryptBlock=function(M){M=asUInt32Array(M)
var m1=M[1]
M[1]=M[3]
M[3]=m1
var out=cryptBlock(M,this._invKeySchedule,G.INV_SUB_MIX,G.INV_SBOX,this._nRounds)
var buf=Buffer.allocUnsafe(16)
buf.writeUInt32BE(out[0],0)
buf.writeUInt32BE(out[3],4)
buf.writeUInt32BE(out[2],8)
buf.writeUInt32BE(out[1],12)
return buf}
AES.prototype.scrub=function(){scrubVec(this._keySchedule)
scrubVec(this._invKeySchedule)
scrubVec(this._key)}
module.exports.AES=AES},{"safe-buffer":148}],21:[function(require,module,exports){var aes=require('./aes')
var Buffer=require('safe-buffer').Buffer
var Transform=require('cipher-base')
var inherits=require('inherits')
var GHASH=require('./ghash')
var xor=require('buffer-xor')
var incr32=require('./incr32')
function xorTest(a,b){var out=0
if(a.length!==b.length)out++
var len=Math.min(a.length,b.length)
for(var i=0;i<len;++i){out+=(a[i]^b[i])}
return out}
function calcIv(self,iv,ck){if(iv.length===12){self._finID=Buffer.concat([iv,Buffer.from([0,0,0,1])])
return Buffer.concat([iv,Buffer.from([0,0,0,2])])}
var ghash=new GHASH(ck)
var len=iv.length
var toPad=len%16
ghash.update(iv)
if(toPad){toPad=16-toPad
ghash.update(Buffer.alloc(toPad,0))}
ghash.update(Buffer.alloc(8,0))
var ivBits=len*8
var tail=Buffer.alloc(8)
tail.writeUIntBE(ivBits,0,8)
ghash.update(tail)
self._finID=ghash.state
var out=Buffer.from(self._finID)
incr32(out)
return out}
function StreamCipher(mode,key,iv,decrypt){Transform.call(this)
var h=Buffer.alloc(4,0)
this._cipher=new aes.AES(key)
var ck=this._cipher.encryptBlock(h)
this._ghash=new GHASH(ck)
iv=calcIv(this,iv,ck)
this._prev=Buffer.from(iv)
this._cache=Buffer.allocUnsafe(0)
this._secCache=Buffer.allocUnsafe(0)
this._decrypt=decrypt
this._alen=0
this._len=0
this._mode=mode
this._authTag=null
this._called=!1}
inherits(StreamCipher,Transform)
StreamCipher.prototype._update=function(chunk){if(!this._called&&this._alen){var rump=16-(this._alen%16)
if(rump<16){rump=Buffer.alloc(rump,0)
this._ghash.update(rump)}}
this._called=!0
var out=this._mode.encrypt(this,chunk)
if(this._decrypt){this._ghash.update(chunk)}else{this._ghash.update(out)}
this._len+=chunk.length
return out}
StreamCipher.prototype._final=function(){if(this._decrypt&&!this._authTag)throw new Error('Unsupported state or unable to authenticate data')
var tag=xor(this._ghash.final(this._alen*8,this._len*8),this._cipher.encryptBlock(this._finID))
if(this._decrypt&&xorTest(tag,this._authTag))throw new Error('Unsupported state or unable to authenticate data')
this._authTag=tag
this._cipher.scrub()}
StreamCipher.prototype.getAuthTag=function getAuthTag(){if(this._decrypt||!Buffer.isBuffer(this._authTag))throw new Error('Attempting to get auth tag in unsupported state')
return this._authTag}
StreamCipher.prototype.setAuthTag=function setAuthTag(tag){if(!this._decrypt)throw new Error('Attempting to set auth tag in unsupported state')
this._authTag=tag}
StreamCipher.prototype.setAAD=function setAAD(buf){if(this._called)throw new Error('Attempting to set AAD in unsupported state')
this._ghash.update(buf)
this._alen+=buf.length}
module.exports=StreamCipher},{"./aes":20,"./ghash":25,"./incr32":26,"buffer-xor":47,"cipher-base":50,"inherits":102,"safe-buffer":148}],22:[function(require,module,exports){var ciphers=require('./encrypter')
var deciphers=require('./decrypter')
var modes=require('./modes/list.json')
function getCiphers(){return Object.keys(modes)}
exports.createCipher=exports.Cipher=ciphers.createCipher
exports.createCipheriv=exports.Cipheriv=ciphers.createCipheriv
exports.createDecipher=exports.Decipher=deciphers.createDecipher
exports.createDecipheriv=exports.Decipheriv=deciphers.createDecipheriv
exports.listCiphers=exports.getCiphers=getCiphers},{"./decrypter":23,"./encrypter":24,"./modes/list.json":34}],23:[function(require,module,exports){var AuthCipher=require('./authCipher')
var Buffer=require('safe-buffer').Buffer
var MODES=require('./modes')
var StreamCipher=require('./streamCipher')
var Transform=require('cipher-base')
var aes=require('./aes')
var ebtk=require('evp_bytestokey')
var inherits=require('inherits')
function Decipher(mode,key,iv){Transform.call(this)
this._cache=new Splitter()
this._last=void 0
this._cipher=new aes.AES(key)
this._prev=Buffer.from(iv)
this._mode=mode
this._autopadding=!0}
inherits(Decipher,Transform)
Decipher.prototype._update=function(data){this._cache.add(data)
var chunk
var thing
var out=[]
while((chunk=this._cache.get(this._autopadding))){thing=this._mode.decrypt(this,chunk)
out.push(thing)}
return Buffer.concat(out)}
Decipher.prototype._final=function(){var chunk=this._cache.flush()
if(this._autopadding){return unpad(this._mode.decrypt(this,chunk))}else if(chunk){throw new Error('data not multiple of block length')}}
Decipher.prototype.setAutoPadding=function(setTo){this._autopadding=!!setTo
return this}
function Splitter(){this.cache=Buffer.allocUnsafe(0)}
Splitter.prototype.add=function(data){this.cache=Buffer.concat([this.cache,data])}
Splitter.prototype.get=function(autoPadding){var out
if(autoPadding){if(this.cache.length>16){out=this.cache.slice(0,16)
this.cache=this.cache.slice(16)
return out}}else{if(this.cache.length>=16){out=this.cache.slice(0,16)
this.cache=this.cache.slice(16)
return out}}
return null}
Splitter.prototype.flush=function(){if(this.cache.length)return this.cache}
function unpad(last){var padded=last[15]
if(padded<1||padded>16){throw new Error('unable to decrypt data')}
var i=-1
while(++i<padded){if(last[(i+(16-padded))]!==padded){throw new Error('unable to decrypt data')}}
if(padded===16)return
return last.slice(0,16-padded)}
function createDecipheriv(suite,password,iv){var config=MODES[suite.toLowerCase()]
if(!config)throw new TypeError('invalid suite type')
if(typeof iv==='string')iv=Buffer.from(iv)
if(config.mode!=='GCM'&&iv.length!==config.iv)throw new TypeError('invalid iv length '+iv.length)
if(typeof password==='string')password=Buffer.from(password)
if(password.length!==config.key/8)throw new TypeError('invalid key length '+password.length)
if(config.type==='stream'){return new StreamCipher(config.module,password,iv,!0)}else if(config.type==='auth'){return new AuthCipher(config.module,password,iv,!0)}
return new Decipher(config.module,password,iv)}
function createDecipher(suite,password){var config=MODES[suite.toLowerCase()]
if(!config)throw new TypeError('invalid suite type')
var keys=ebtk(password,!1,config.key,config.iv)
return createDecipheriv(suite,keys.key,keys.iv)}
exports.createDecipher=createDecipher
exports.createDecipheriv=createDecipheriv},{"./aes":20,"./authCipher":21,"./modes":33,"./streamCipher":36,"cipher-base":50,"evp_bytestokey":85,"inherits":102,"safe-buffer":148}],24:[function(require,module,exports){var MODES=require('./modes')
var AuthCipher=require('./authCipher')
var Buffer=require('safe-buffer').Buffer
var StreamCipher=require('./streamCipher')
var Transform=require('cipher-base')
var aes=require('./aes')
var ebtk=require('evp_bytestokey')
var inherits=require('inherits')
function Cipher(mode,key,iv){Transform.call(this)
this._cache=new Splitter()
this._cipher=new aes.AES(key)
this._prev=Buffer.from(iv)
this._mode=mode
this._autopadding=!0}
inherits(Cipher,Transform)
Cipher.prototype._update=function(data){this._cache.add(data)
var chunk
var thing
var out=[]
while((chunk=this._cache.get())){thing=this._mode.encrypt(this,chunk)
out.push(thing)}
return Buffer.concat(out)}
var PADDING=Buffer.alloc(16,0x10)
Cipher.prototype._final=function(){var chunk=this._cache.flush()
if(this._autopadding){chunk=this._mode.encrypt(this,chunk)
this._cipher.scrub()
return chunk}
if(!chunk.equals(PADDING)){this._cipher.scrub()
throw new Error('data not multiple of block length')}}
Cipher.prototype.setAutoPadding=function(setTo){this._autopadding=!!setTo
return this}
function Splitter(){this.cache=Buffer.allocUnsafe(0)}
Splitter.prototype.add=function(data){this.cache=Buffer.concat([this.cache,data])}
Splitter.prototype.get=function(){if(this.cache.length>15){var out=this.cache.slice(0,16)
this.cache=this.cache.slice(16)
return out}
return null}
Splitter.prototype.flush=function(){var len=16-this.cache.length
var padBuff=Buffer.allocUnsafe(len)
var i=-1
while(++i<len){padBuff.writeUInt8(len,i)}
return Buffer.concat([this.cache,padBuff])}
function createCipheriv(suite,password,iv){var config=MODES[suite.toLowerCase()]
if(!config)throw new TypeError('invalid suite type')
if(typeof password==='string')password=Buffer.from(password)
if(password.length!==config.key/8)throw new TypeError('invalid key length '+password.length)
if(typeof iv==='string')iv=Buffer.from(iv)
if(config.mode!=='GCM'&&iv.length!==config.iv)throw new TypeError('invalid iv length '+iv.length)
if(config.type==='stream'){return new StreamCipher(config.module,password,iv)}else if(config.type==='auth'){return new AuthCipher(config.module,password,iv)}
return new Cipher(config.module,password,iv)}
function createCipher(suite,password){var config=MODES[suite.toLowerCase()]
if(!config)throw new TypeError('invalid suite type')
var keys=ebtk(password,!1,config.key,config.iv)
return createCipheriv(suite,keys.key,keys.iv)}
exports.createCipheriv=createCipheriv
exports.createCipher=createCipher},{"./aes":20,"./authCipher":21,"./modes":33,"./streamCipher":36,"cipher-base":50,"evp_bytestokey":85,"inherits":102,"safe-buffer":148}],25:[function(require,module,exports){var Buffer=require('safe-buffer').Buffer
var ZEROES=Buffer.alloc(16,0)
function toArray(buf){return[buf.readUInt32BE(0),buf.readUInt32BE(4),buf.readUInt32BE(8),buf.readUInt32BE(12)]}
function fromArray(out){var buf=Buffer.allocUnsafe(16)
buf.writeUInt32BE(out[0]>>>0,0)
buf.writeUInt32BE(out[1]>>>0,4)
buf.writeUInt32BE(out[2]>>>0,8)
buf.writeUInt32BE(out[3]>>>0,12)
return buf}
function GHASH(key){this.h=key
this.state=Buffer.alloc(16,0)
this.cache=Buffer.allocUnsafe(0)}
GHASH.prototype.ghash=function(block){var i=-1
while(++i<block.length){this.state[i]^=block[i]}
this._multiply()}
GHASH.prototype._multiply=function(){var Vi=toArray(this.h)
var Zi=[0,0,0,0]
var j,xi,lsbVi
var i=-1
while(++i<128){xi=(this.state[~~(i/8)]&(1<<(7-(i%8))))!==0
if(xi){Zi[0]^=Vi[0]
Zi[1]^=Vi[1]
Zi[2]^=Vi[2]
Zi[3]^=Vi[3]}
lsbVi=(Vi[3]&1)!==0
for(j=3;j>0;j--){Vi[j]=(Vi[j]>>>1)|((Vi[j-1]&1)<<31)}
Vi[0]=Vi[0]>>>1
if(lsbVi){Vi[0]=Vi[0]^(0xe1<<24)}}
this.state=fromArray(Zi)}
GHASH.prototype.update=function(buf){this.cache=Buffer.concat([this.cache,buf])
var chunk
while(this.cache.length>=16){chunk=this.cache.slice(0,16)
this.cache=this.cache.slice(16)
this.ghash(chunk)}}
GHASH.prototype.final=function(abl,bl){if(this.cache.length){this.ghash(Buffer.concat([this.cache,ZEROES],16))}
this.ghash(fromArray([0,abl,0,bl]))
return this.state}
module.exports=GHASH},{"safe-buffer":148}],26:[function(require,module,exports){function incr32(iv){var len=iv.length
var item
while(len--){item=iv.readUInt8(len)
if(item===255){iv.writeUInt8(0,len)}else{item++
iv.writeUInt8(item,len)
break}}}
module.exports=incr32},{}],27:[function(require,module,exports){var xor=require('buffer-xor')
exports.encrypt=function(self,block){var data=xor(block,self._prev)
self._prev=self._cipher.encryptBlock(data)
return self._prev}
exports.decrypt=function(self,block){var pad=self._prev
self._prev=block
var out=self._cipher.decryptBlock(block)
return xor(out,pad)}},{"buffer-xor":47}],28:[function(require,module,exports){var Buffer=require('safe-buffer').Buffer
var xor=require('buffer-xor')
function encryptStart(self,data,decrypt){var len=data.length
var out=xor(data,self._cache)
self._cache=self._cache.slice(len)
self._prev=Buffer.concat([self._prev,decrypt?data:out])
return out}
exports.encrypt=function(self,data,decrypt){var out=Buffer.allocUnsafe(0)
var len
while(data.length){if(self._cache.length===0){self._cache=self._cipher.encryptBlock(self._prev)
self._prev=Buffer.allocUnsafe(0)}
if(self._cache.length<=data.length){len=self._cache.length
out=Buffer.concat([out,encryptStart(self,data.slice(0,len),decrypt)])
data=data.slice(len)}else{out=Buffer.concat([out,encryptStart(self,data,decrypt)])
break}}
return out}},{"buffer-xor":47,"safe-buffer":148}],29:[function(require,module,exports){var Buffer=require('safe-buffer').Buffer
function encryptByte(self,byteParam,decrypt){var pad
var i=-1
var len=8
var out=0
var bit,value
while(++i<len){pad=self._cipher.encryptBlock(self._prev)
bit=(byteParam&(1<<(7-i)))?0x80:0
value=pad[0]^bit
out+=((value&0x80)>>(i%8))
self._prev=shiftIn(self._prev,decrypt?bit:value)}
return out}
function shiftIn(buffer,value){var len=buffer.length
var i=-1
var out=Buffer.allocUnsafe(buffer.length)
buffer=Buffer.concat([buffer,Buffer.from([value])])
while(++i<len){out[i]=buffer[i]<<1|buffer[i+1]>>(7)}
return out}
exports.encrypt=function(self,chunk,decrypt){var len=chunk.length
var out=Buffer.allocUnsafe(len)
var i=-1
while(++i<len){out[i]=encryptByte(self,chunk[i],decrypt)}
return out}},{"safe-buffer":148}],30:[function(require,module,exports){var Buffer=require('safe-buffer').Buffer
function encryptByte(self,byteParam,decrypt){var pad=self._cipher.encryptBlock(self._prev)
var out=pad[0]^byteParam
self._prev=Buffer.concat([self._prev.slice(1),Buffer.from([decrypt?byteParam:out])])
return out}
exports.encrypt=function(self,chunk,decrypt){var len=chunk.length
var out=Buffer.allocUnsafe(len)
var i=-1
while(++i<len){out[i]=encryptByte(self,chunk[i],decrypt)}
return out}},{"safe-buffer":148}],31:[function(require,module,exports){var xor=require('buffer-xor')
var Buffer=require('safe-buffer').Buffer
var incr32=require('../incr32')
function getBlock(self){var out=self._cipher.encryptBlockRaw(self._prev)
incr32(self._prev)
return out}
var blockSize=16
exports.encrypt=function(self,chunk){var chunkNum=Math.ceil(chunk.length/blockSize)
var start=self._cache.length
self._cache=Buffer.concat([self._cache,Buffer.allocUnsafe(chunkNum*blockSize)])
for(var i=0;i<chunkNum;i++){var out=getBlock(self)
var offset=start+i*blockSize
self._cache.writeUInt32BE(out[0],offset+0)
self._cache.writeUInt32BE(out[1],offset+4)
self._cache.writeUInt32BE(out[2],offset+8)
self._cache.writeUInt32BE(out[3],offset+12)}
var pad=self._cache.slice(0,chunk.length)
self._cache=self._cache.slice(chunk.length)
return xor(chunk,pad)}},{"../incr32":26,"buffer-xor":47,"safe-buffer":148}],32:[function(require,module,exports){exports.encrypt=function(self,block){return self._cipher.encryptBlock(block)}
exports.decrypt=function(self,block){return self._cipher.decryptBlock(block)}},{}],33:[function(require,module,exports){var modeModules={ECB:require('./ecb'),CBC:require('./cbc'),CFB:require('./cfb'),CFB8:require('./cfb8'),CFB1:require('./cfb1'),OFB:require('./ofb'),CTR:require('./ctr'),GCM:require('./ctr')}
var modes=require('./list.json')
for(var key in modes){modes[key].module=modeModules[modes[key].mode]}
module.exports=modes},{"./cbc":27,"./cfb":28,"./cfb1":29,"./cfb8":30,"./ctr":31,"./ecb":32,"./list.json":34,"./ofb":35}],34:[function(require,module,exports){module.exports={"aes-128-ecb":{"cipher":"AES","key":128,"iv":0,"mode":"ECB","type":"block"},"aes-192-ecb":{"cipher":"AES","key":192,"iv":0,"mode":"ECB","type":"block"},"aes-256-ecb":{"cipher":"AES","key":256,"iv":0,"mode":"ECB","type":"block"},"aes-128-cbc":{"cipher":"AES","key":128,"iv":16,"mode":"CBC","type":"block"},"aes-192-cbc":{"cipher":"AES","key":192,"iv":16,"mode":"CBC","type":"block"},"aes-256-cbc":{"cipher":"AES","key":256,"iv":16,"mode":"CBC","type":"block"},"aes128":{"cipher":"AES","key":128,"iv":16,"mode":"CBC","type":"block"},"aes192":{"cipher":"AES","key":192,"iv":16,"mode":"CBC","type":"block"},"aes256":{"cipher":"AES","key":256,"iv":16,"mode":"CBC","type":"block"},"aes-128-cfb":{"cipher":"AES","key":128,"iv":16,"mode":"CFB","type":"stream"},"aes-192-cfb":{"cipher":"AES","key":192,"iv":16,"mode":"CFB","type":"stream"},"aes-256-cfb":{"cipher":"AES","key":256,"iv":16,"mode":"CFB","type":"stream"},"aes-128-cfb8":{"cipher":"AES","key":128,"iv":16,"mode":"CFB8","type":"stream"},"aes-192-cfb8":{"cipher":"AES","key":192,"iv":16,"mode":"CFB8","type":"stream"},"aes-256-cfb8":{"cipher":"AES","key":256,"iv":16,"mode":"CFB8","type":"stream"},"aes-128-cfb1":{"cipher":"AES","key":128,"iv":16,"mode":"CFB1","type":"stream"},"aes-192-cfb1":{"cipher":"AES","key":192,"iv":16,"mode":"CFB1","type":"stream"},"aes-256-cfb1":{"cipher":"AES","key":256,"iv":16,"mode":"CFB1","type":"stream"},"aes-128-ofb":{"cipher":"AES","key":128,"iv":16,"mode":"OFB","type":"stream"},"aes-192-ofb":{"cipher":"AES","key":192,"iv":16,"mode":"OFB","type":"stream"},"aes-256-ofb":{"cipher":"AES","key":256,"iv":16,"mode":"OFB","type":"stream"},"aes-128-ctr":{"cipher":"AES","key":128,"iv":16,"mode":"CTR","type":"stream"},"aes-192-ctr":{"cipher":"AES","key":192,"iv":16,"mode":"CTR","type":"stream"},"aes-256-ctr":{"cipher":"AES","key":256,"iv":16,"mode":"CTR","type":"stream"},"aes-128-gcm":{"cipher":"AES","key":128,"iv":12,"mode":"GCM","type":"auth"},"aes-192-gcm":{"cipher":"AES","key":192,"iv":12,"mode":"GCM","type":"auth"},"aes-256-gcm":{"cipher":"AES","key":256,"iv":12,"mode":"GCM","type":"auth"}}},{}],35:[function(require,module,exports){(function(Buffer){var xor=require('buffer-xor')
function getBlock(self){self._prev=self._cipher.encryptBlock(self._prev)
return self._prev}
exports.encrypt=function(self,chunk){while(self._cache.length<chunk.length){self._cache=Buffer.concat([self._cache,getBlock(self)])}
var pad=self._cache.slice(0,chunk.length)
self._cache=self._cache.slice(chunk.length)
return xor(chunk,pad)}}).call(this,require("buffer").Buffer)},{"buffer":48,"buffer-xor":47}],36:[function(require,module,exports){var aes=require('./aes')
var Buffer=require('safe-buffer').Buffer
var Transform=require('cipher-base')
var inherits=require('inherits')
function StreamCipher(mode,key,iv,decrypt){Transform.call(this)
this._cipher=new aes.AES(key)
this._prev=Buffer.from(iv)
this._cache=Buffer.allocUnsafe(0)
this._secCache=Buffer.allocUnsafe(0)
this._decrypt=decrypt
this._mode=mode}
inherits(StreamCipher,Transform)
StreamCipher.prototype._update=function(chunk){return this._mode.encrypt(this,chunk,this._decrypt)}
StreamCipher.prototype._final=function(){this._cipher.scrub()}
module.exports=StreamCipher},{"./aes":20,"cipher-base":50,"inherits":102,"safe-buffer":148}],37:[function(require,module,exports){var DES=require('browserify-des')
var aes=require('browserify-aes/browser')
var aesModes=require('browserify-aes/modes')
var desModes=require('browserify-des/modes')
var ebtk=require('evp_bytestokey')
function createCipher(suite,password){suite=suite.toLowerCase()
var keyLen,ivLen
if(aesModes[suite]){keyLen=aesModes[suite].key
ivLen=aesModes[suite].iv}else if(desModes[suite]){keyLen=desModes[suite].key*8
ivLen=desModes[suite].iv}else{throw new TypeError('invalid suite type')}
var keys=ebtk(password,!1,keyLen,ivLen)
return createCipheriv(suite,keys.key,keys.iv)}
function createDecipher(suite,password){suite=suite.toLowerCase()
var keyLen,ivLen
if(aesModes[suite]){keyLen=aesModes[suite].key
ivLen=aesModes[suite].iv}else if(desModes[suite]){keyLen=desModes[suite].key*8
ivLen=desModes[suite].iv}else{throw new TypeError('invalid suite type')}
var keys=ebtk(password,!1,keyLen,ivLen)
return createDecipheriv(suite,keys.key,keys.iv)}
function createCipheriv(suite,key,iv){suite=suite.toLowerCase()
if(aesModes[suite])return aes.createCipheriv(suite,key,iv)
if(desModes[suite])return new DES({key:key,iv:iv,mode:suite})
throw new TypeError('invalid suite type')}
function createDecipheriv(suite,key,iv){suite=suite.toLowerCase()
if(aesModes[suite])return aes.createDecipheriv(suite,key,iv)
if(desModes[suite])return new DES({key:key,iv:iv,mode:suite,decrypt:!0})
throw new TypeError('invalid suite type')}
function getCiphers(){return Object.keys(desModes).concat(aes.getCiphers())}
exports.createCipher=exports.Cipher=createCipher
exports.createCipheriv=exports.Cipheriv=createCipheriv
exports.createDecipher=exports.Decipher=createDecipher
exports.createDecipheriv=exports.Decipheriv=createDecipheriv
exports.listCiphers=exports.getCiphers=getCiphers},{"browserify-aes/browser":22,"browserify-aes/modes":33,"browserify-des":38,"browserify-des/modes":39,"evp_bytestokey":85}],38:[function(require,module,exports){var CipherBase=require('cipher-base')
var des=require('des.js')
var inherits=require('inherits')
var Buffer=require('safe-buffer').Buffer
var modes={'des-ede3-cbc':des.CBC.instantiate(des.EDE),'des-ede3':des.EDE,'des-ede-cbc':des.CBC.instantiate(des.EDE),'des-ede':des.EDE,'des-cbc':des.CBC.instantiate(des.DES),'des-ecb':des.DES}
modes.des=modes['des-cbc']
modes.des3=modes['des-ede3-cbc']
module.exports=DES
inherits(DES,CipherBase)
function DES(opts){CipherBase.call(this)
var modeName=opts.mode.toLowerCase()
var mode=modes[modeName]
var type
if(opts.decrypt){type='decrypt'}else{type='encrypt'}
var key=opts.key
if(!Buffer.isBuffer(key)){key=Buffer.from(key)}
if(modeName==='des-ede'||modeName==='des-ede-cbc'){key=Buffer.concat([key,key.slice(0,8)])}
var iv=opts.iv
if(!Buffer.isBuffer(iv)){iv=Buffer.from(iv)}
this._des=mode.create({key:key,iv:iv,type:type})}
DES.prototype._update=function(data){return Buffer.from(this._des.update(data))}
DES.prototype._final=function(){return Buffer.from(this._des.final())}},{"cipher-base":50,"des.js":58,"inherits":102,"safe-buffer":148}],39:[function(require,module,exports){exports['des-ecb']={key:8,iv:0}
exports['des-cbc']=exports.des={key:8,iv:8}
exports['des-ede3-cbc']=exports.des3={key:24,iv:8}
exports['des-ede3']={key:24,iv:0}
exports['des-ede-cbc']={key:16,iv:8}
exports['des-ede']={key:16,iv:0}},{}],40:[function(require,module,exports){(function(Buffer){var bn=require('bn.js');var randomBytes=require('randombytes');module.exports=crt;function blind(priv){var r=getr(priv);var blinder=r.toRed(bn.mont(priv.modulus)).redPow(new bn(priv.publicExponent)).fromRed();return{blinder:blinder,unblinder:r.invm(priv.modulus)}}
function crt(msg,priv){var blinds=blind(priv);var len=priv.modulus.byteLength();var mod=bn.mont(priv.modulus);var blinded=new bn(msg).mul(blinds.blinder).umod(priv.modulus);var c1=blinded.toRed(bn.mont(priv.prime1));var c2=blinded.toRed(bn.mont(priv.prime2));var qinv=priv.coefficient;var p=priv.prime1;var q=priv.prime2;var m1=c1.redPow(priv.exponent1);var m2=c2.redPow(priv.exponent2);m1=m1.fromRed();m2=m2.fromRed();var h=m1.isub(m2).imul(qinv).umod(p);h.imul(q);m2.iadd(h);return new Buffer(m2.imul(blinds.unblinder).umod(priv.modulus).toArray(!1,len))}
crt.getr=getr;function getr(priv){var len=priv.modulus.byteLength();var r=new bn(randomBytes(len));while(r.cmp(priv.modulus)>=0||!r.umod(priv.prime1)||!r.umod(priv.prime2)){r=new bn(randomBytes(len))}
return r}}).call(this,require("buffer").Buffer)},{"bn.js":17,"buffer":48,"randombytes":132}],41:[function(require,module,exports){module.exports=require('./browser/algorithms.json')},{"./browser/algorithms.json":42}],42:[function(require,module,exports){module.exports={"sha224WithRSAEncryption":{"sign":"rsa","hash":"sha224","id":"302d300d06096086480165030402040500041c"},"RSA-SHA224":{"sign":"ecdsa/rsa","hash":"sha224","id":"302d300d06096086480165030402040500041c"},"sha256WithRSAEncryption":{"sign":"rsa","hash":"sha256","id":"3031300d060960864801650304020105000420"},"RSA-SHA256":{"sign":"ecdsa/rsa","hash":"sha256","id":"3031300d060960864801650304020105000420"},"sha384WithRSAEncryption":{"sign":"rsa","hash":"sha384","id":"3041300d060960864801650304020205000430"},"RSA-SHA384":{"sign":"ecdsa/rsa","hash":"sha384","id":"3041300d060960864801650304020205000430"},"sha512WithRSAEncryption":{"sign":"rsa","hash":"sha512","id":"3051300d060960864801650304020305000440"},"RSA-SHA512":{"sign":"ecdsa/rsa","hash":"sha512","id":"3051300d060960864801650304020305000440"},"RSA-SHA1":{"sign":"rsa","hash":"sha1","id":"3021300906052b0e03021a05000414"},"ecdsa-with-SHA1":{"sign":"ecdsa","hash":"sha1","id":""},"sha256":{"sign":"ecdsa","hash":"sha256","id":""},"sha224":{"sign":"ecdsa","hash":"sha224","id":""},"sha384":{"sign":"ecdsa","hash":"sha384","id":""},"sha512":{"sign":"ecdsa","hash":"sha512","id":""},"DSA-SHA":{"sign":"dsa","hash":"sha1","id":""},"DSA-SHA1":{"sign":"dsa","hash":"sha1","id":""},"DSA":{"sign":"dsa","hash":"sha1","id":""},"DSA-WITH-SHA224":{"sign":"dsa","hash":"sha224","id":""},"DSA-SHA224":{"sign":"dsa","hash":"sha224","id":""},"DSA-WITH-SHA256":{"sign":"dsa","hash":"sha256","id":""},"DSA-SHA256":{"sign":"dsa","hash":"sha256","id":""},"DSA-WITH-SHA384":{"sign":"dsa","hash":"sha384","id":""},"DSA-SHA384":{"sign":"dsa","hash":"sha384","id":""},"DSA-WITH-SHA512":{"sign":"dsa","hash":"sha512","id":""},"DSA-SHA512":{"sign":"dsa","hash":"sha512","id":""},"DSA-RIPEMD160":{"sign":"dsa","hash":"rmd160","id":""},"ripemd160WithRSA":{"sign":"rsa","hash":"rmd160","id":"3021300906052b2403020105000414"},"RSA-RIPEMD160":{"sign":"rsa","hash":"rmd160","id":"3021300906052b2403020105000414"},"md5WithRSAEncryption":{"sign":"rsa","hash":"md5","id":"3020300c06082a864886f70d020505000410"},"RSA-MD5":{"sign":"rsa","hash":"md5","id":"3020300c06082a864886f70d020505000410"}}},{}],43:[function(require,module,exports){module.exports={"1.3.132.0.10":"secp256k1","1.3.132.0.33":"p224","1.2.840.10045.3.1.1":"p192","1.2.840.10045.3.1.7":"p256","1.3.132.0.34":"p384","1.3.132.0.35":"p521"}},{}],44:[function(require,module,exports){(function(Buffer){var createHash=require('create-hash')
var stream=require('stream')
var inherits=require('inherits')
var sign=require('./sign')
var verify=require('./verify')
var algorithms=require('./algorithms.json')
Object.keys(algorithms).forEach(function(key){algorithms[key].id=new Buffer(algorithms[key].id,'hex')
algorithms[key.toLowerCase()]=algorithms[key]})
function Sign(algorithm){stream.Writable.call(this)
var data=algorithms[algorithm]
if(!data)throw new Error('Unknown message digest')
this._hashType=data.hash
this._hash=createHash(data.hash)
this._tag=data.id
this._signType=data.sign}
inherits(Sign,stream.Writable)
Sign.prototype._write=function _write(data,_,done){this._hash.update(data)
done()}
Sign.prototype.update=function update(data,enc){if(typeof data==='string')data=new Buffer(data,enc)
this._hash.update(data)
return this}
Sign.prototype.sign=function signMethod(key,enc){this.end()
var hash=this._hash.digest()
var sig=sign(hash,key,this._hashType,this._signType,this._tag)
return enc?sig.toString(enc):sig}
function Verify(algorithm){stream.Writable.call(this)
var data=algorithms[algorithm]
if(!data)throw new Error('Unknown message digest')
this._hash=createHash(data.hash)
this._tag=data.id
this._signType=data.sign}
inherits(Verify,stream.Writable)
Verify.prototype._write=function _write(data,_,done){this._hash.update(data)
done()}
Verify.prototype.update=function update(data,enc){if(typeof data==='string')data=new Buffer(data,enc)
this._hash.update(data)
return this}
Verify.prototype.verify=function verifyMethod(key,sig,enc){if(typeof sig==='string')sig=new Buffer(sig,enc)
this.end()
var hash=this._hash.digest()
return verify(sig,hash,key,this._signType,this._tag)}
function createSign(algorithm){return new Sign(algorithm)}
function createVerify(algorithm){return new Verify(algorithm)}
module.exports={Sign:createSign,Verify:createVerify,createSign:createSign,createVerify:createVerify}}).call(this,require("buffer").Buffer)},{"./algorithms.json":42,"./sign":45,"./verify":46,"buffer":48,"create-hash":53,"inherits":102,"stream":157}],45:[function(require,module,exports){(function(Buffer){var createHmac=require('create-hmac')
var crt=require('browserify-rsa')
var EC=require('elliptic').ec
var BN=require('bn.js')
var parseKeys=require('parse-asn1')
var curves=require('./curves.json')
function sign(hash,key,hashType,signType,tag){var priv=parseKeys(key)
if(priv.curve){if(signType!=='ecdsa'&&signType!=='ecdsa/rsa')throw new Error('wrong private key type')
return ecSign(hash,priv)}else if(priv.type==='dsa'){if(signType!=='dsa')throw new Error('wrong private key type')
return dsaSign(hash,priv,hashType)}else{if(signType!=='rsa'&&signType!=='ecdsa/rsa')throw new Error('wrong private key type')}
hash=Buffer.concat([tag,hash])
var len=priv.modulus.byteLength()
var pad=[0,1]
while(hash.length+pad.length+1<len)pad.push(0xff)
pad.push(0x00)
var i=-1
while(++i<hash.length)pad.push(hash[i])
var out=crt(pad,priv)
return out}
function ecSign(hash,priv){var curveId=curves[priv.curve.join('.')]
if(!curveId)throw new Error('unknown curve '+priv.curve.join('.'))
var curve=new EC(curveId)
var key=curve.keyFromPrivate(priv.privateKey)
var out=key.sign(hash)
return new Buffer(out.toDER())}
function dsaSign(hash,priv,algo){var x=priv.params.priv_key
var p=priv.params.p
var q=priv.params.q
var g=priv.params.g
var r=new BN(0)
var k
var H=bits2int(hash,q).mod(q)
var s=!1
var kv=getKey(x,q,hash,algo)
while(s===!1){k=makeKey(q,kv,algo)
r=makeR(g,k,p,q)
s=k.invm(q).imul(H.add(x.mul(r))).mod(q)
if(s.cmpn(0)===0){s=!1
r=new BN(0)}}
return toDER(r,s)}
function toDER(r,s){r=r.toArray()
s=s.toArray()
if(r[0]&0x80)r=[0].concat(r)
if(s[0]&0x80)s=[0].concat(s)
var total=r.length+s.length+4
var res=[0x30,total,0x02,r.length]
res=res.concat(r,[0x02,s.length],s)
return new Buffer(res)}
function getKey(x,q,hash,algo){x=new Buffer(x.toArray())
if(x.length<q.byteLength()){var zeros=new Buffer(q.byteLength()-x.length)
zeros.fill(0)
x=Buffer.concat([zeros,x])}
var hlen=hash.length
var hbits=bits2octets(hash,q)
var v=new Buffer(hlen)
v.fill(1)
var k=new Buffer(hlen)
k.fill(0)
k=createHmac(algo,k).update(v).update(new Buffer([0])).update(x).update(hbits).digest()
v=createHmac(algo,k).update(v).digest()
k=createHmac(algo,k).update(v).update(new Buffer([1])).update(x).update(hbits).digest()
v=createHmac(algo,k).update(v).digest()
return{k:k,v:v}}
function bits2int(obits,q){var bits=new BN(obits)
var shift=(obits.length<<3)-q.bitLength()
if(shift>0)bits.ishrn(shift)
return bits}
function bits2octets(bits,q){bits=bits2int(bits,q)
bits=bits.mod(q)
var out=new Buffer(bits.toArray())
if(out.length<q.byteLength()){var zeros=new Buffer(q.byteLength()-out.length)
zeros.fill(0)
out=Buffer.concat([zeros,out])}
return out}
function makeKey(q,kv,algo){var t
var k
do{t=new Buffer(0)
while(t.length*8<q.bitLength()){kv.v=createHmac(algo,kv.k).update(kv.v).digest()
t=Buffer.concat([t,kv.v])}
k=bits2int(t,q)
kv.k=createHmac(algo,kv.k).update(kv.v).update(new Buffer([0])).digest()
kv.v=createHmac(algo,kv.k).update(kv.v).digest()}while(k.cmp(q)!==-1)
return k}
function makeR(g,k,p,q){return g.toRed(BN.mont(p)).redPow(k).fromRed().mod(q)}
module.exports=sign
module.exports.getKey=getKey
module.exports.makeKey=makeKey}).call(this,require("buffer").Buffer)},{"./curves.json":43,"bn.js":17,"browserify-rsa":40,"buffer":48,"create-hmac":55,"elliptic":68,"parse-asn1":114}],46:[function(require,module,exports){(function(Buffer){var BN=require('bn.js')
var EC=require('elliptic').ec
var parseKeys=require('parse-asn1')
var curves=require('./curves.json')
function verify(sig,hash,key,signType,tag){var pub=parseKeys(key)
if(pub.type==='ec'){if(signType!=='ecdsa'&&signType!=='ecdsa/rsa')throw new Error('wrong public key type')
return ecVerify(sig,hash,pub)}else if(pub.type==='dsa'){if(signType!=='dsa')throw new Error('wrong public key type')
return dsaVerify(sig,hash,pub)}else{if(signType!=='rsa'&&signType!=='ecdsa/rsa')throw new Error('wrong public key type')}
hash=Buffer.concat([tag,hash])
var len=pub.modulus.byteLength()
var pad=[1]
var padNum=0
while(hash.length+pad.length+2<len){pad.push(0xff)
padNum++}
pad.push(0x00)
var i=-1
while(++i<hash.length){pad.push(hash[i])}
pad=new Buffer(pad)
var red=BN.mont(pub.modulus)
sig=new BN(sig).toRed(red)
sig=sig.redPow(new BN(pub.publicExponent))
sig=new Buffer(sig.fromRed().toArray())
var out=padNum<8?1:0
len=Math.min(sig.length,pad.length)
if(sig.length!==pad.length)out=1
i=-1
while(++i<len)out|=sig[i]^pad[i]
return out===0}
function ecVerify(sig,hash,pub){var curveId=curves[pub.data.algorithm.curve.join('.')]
if(!curveId)throw new Error('unknown curve '+pub.data.algorithm.curve.join('.'))
var curve=new EC(curveId)
var pubkey=pub.data.subjectPrivateKey.data
return curve.verify(hash,sig,pubkey)}
function dsaVerify(sig,hash,pub){var p=pub.data.p
var q=pub.data.q
var g=pub.data.g
var y=pub.data.pub_key
var unpacked=parseKeys.signature.decode(sig,'der')
var s=unpacked.s
var r=unpacked.r
checkValue(s,q)
checkValue(r,q)
var montp=BN.mont(p)
var w=s.invm(q)
var v=g.toRed(montp).redPow(new BN(hash).mul(w).mod(q)).fromRed().mul(y.toRed(montp).redPow(r.mul(w).mod(q)).fromRed()).mod(p).mod(q)
return v.cmp(r)===0}
function checkValue(b,q){if(b.cmpn(0)<=0)throw new Error('invalid sig')
if(b.cmp(q)>=q)throw new Error('invalid sig')}
module.exports=verify}).call(this,require("buffer").Buffer)},{"./curves.json":43,"bn.js":17,"buffer":48,"elliptic":68,"parse-asn1":114}],47:[function(require,module,exports){(function(Buffer){module.exports=function xor(a,b){var length=Math.min(a.length,b.length)
var buffer=new Buffer(length)
for(var i=0;i<length;++i){buffer[i]=a[i]^b[i]}
return buffer}}).call(this,require("buffer").Buffer)},{"buffer":48}],48:[function(require,module,exports){'use strict'
var base64=require('base64-js')
var ieee754=require('ieee754')
exports.Buffer=Buffer
exports.SlowBuffer=SlowBuffer
exports.INSPECT_MAX_BYTES=50
var K_MAX_LENGTH=0x7fffffff
exports.kMaxLength=K_MAX_LENGTH
Buffer.TYPED_ARRAY_SUPPORT=typedArraySupport()
if(!Buffer.TYPED_ARRAY_SUPPORT&&typeof console!=='undefined'&&typeof console.error==='function'){console.error('This browser lacks typed array (Uint8Array) support which is required by '+'`buffer` v5.x. Use `buffer` v4.x if you require old browser support.')}
function typedArraySupport(){try{var arr=new Uint8Array(1)
arr.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}}
return arr.foo()===42}catch(e){return!1}}
Object.defineProperty(Buffer.prototype,'parent',{enumerable:!0,get:function(){if(!Buffer.isBuffer(this))return undefined
return this.buffer}})
Object.defineProperty(Buffer.prototype,'offset',{enumerable:!0,get:function(){if(!Buffer.isBuffer(this))return undefined
return this.byteOffset}})
function createBuffer(length){if(length>K_MAX_LENGTH){throw new RangeError('The value "'+length+'" is invalid for option "size"')}
var buf=new Uint8Array(length)
buf.__proto__=Buffer.prototype
return buf}
function Buffer(arg,encodingOrOffset,length){if(typeof arg==='number'){if(typeof encodingOrOffset==='string'){throw new TypeError('The "string" argument must be of type string. Received type number')}
return allocUnsafe(arg)}
return from(arg,encodingOrOffset,length)}
if(typeof Symbol!=='undefined'&&Symbol.species!=null&&Buffer[Symbol.species]===Buffer){Object.defineProperty(Buffer,Symbol.species,{value:null,configurable:!0,enumerable:!1,writable:!1})}
Buffer.poolSize=8192
function from(value,encodingOrOffset,length){if(typeof value==='string'){return fromString(value,encodingOrOffset)}
if(ArrayBuffer.isView(value)){return fromArrayLike(value)}
if(value==null){throw TypeError('The first argument must be one of type string,Buffer,ArrayBuffer,Array,'+'or Array-like Object. Received type '+(typeof value))}
if(isInstance(value,ArrayBuffer)||(value&&isInstance(value.buffer,ArrayBuffer))){return fromArrayBuffer(value,encodingOrOffset,length)}
if(typeof value==='number'){throw new TypeError('The "value" argument must not be of type number. Received type number')}
var valueOf=value.valueOf&&value.valueOf()
if(valueOf!=null&&valueOf!==value){return Buffer.from(valueOf,encodingOrOffset,length)}
var b=fromObject(value)
if(b)return b
if(typeof Symbol!=='undefined'&&Symbol.toPrimitive!=null&&typeof value[Symbol.toPrimitive]==='function'){return Buffer.from(value[Symbol.toPrimitive]('string'),encodingOrOffset,length)}
throw new TypeError('The first argument must be one of type string,Buffer,ArrayBuffer,Array,'+'or Array-like Object. Received type '+(typeof value))}
Buffer.from=function(value,encodingOrOffset,length){return from(value,encodingOrOffset,length)}
Buffer.prototype.__proto__=Uint8Array.prototype
Buffer.__proto__=Uint8Array
function assertSize(size){if(typeof size!=='number'){throw new TypeError('"size" argument must be of type number')}else if(size<0){throw new RangeError('The value "'+size+'" is invalid for option "size"')}}
function alloc(size,fill,encoding){assertSize(size)
if(size<=0){return createBuffer(size)}
if(fill!==undefined){if(start===undefined||start<0){start=0}
if(start>this.length){return''}
if(end===undefined||end>this.length){end=this.length}
if(end<=0){return''}
end>>>=0
start>>>=0
if(end<=start){return''}
if(!encoding)encoding='utf8'
while(!0){switch(encoding){case 'hex':return hexSlice(this,start,end)
case 'utf8':case 'utf-8':return utf8Slice(this,start,end)
case 'ascii':return asciiSlice(this,start,end)
case 'latin1':case 'binary':return latin1Slice(this,start,end)
case 'base64':return base64Slice(this,start,end)
case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return utf16leSlice(this,start,end)
default:if(loweredCase)throw new TypeError('Unknown encoding:'+encoding)
encoding=(encoding+'').toLowerCase()
loweredCase=!0}}}
byteOffset=dir?0:(buffer.length-1)}
if(byteOffset<0)byteOffset=buffer.length+byteOffset
if(byteOffset>=buffer.length){if(dir)return-1
else byteOffset=buffer.length-1}else if(byteOffset<0){if(dir)byteOffset=0
else return-1}
if(typeof val==='string'){val=Buffer.from(val,encoding)}
if(Buffer.isBuffer(val)){if(val.length===0){return-1}
return arrayIndexOf(buffer,val,byteOffset,encoding,dir)}else if(typeof val==='number'){val=val&0xFF
if(typeof Uint8Array.prototype.indexOf==='function'){if(dir){return Uint8Array.prototype.indexOf.call(buffer,val,byteOffset)}else{return Uint8Array.prototype.lastIndexOf.call(buffer,val,byteOffset)}}
return arrayIndexOf(buffer,[val],byteOffset,encoding,dir)}
throw new TypeError('val must be string,number or Buffer')}
function arrayIndexOf(arr,val,byteOffset,encoding,dir){var indexSize=1
var arrLength=arr.length
var valLength=val.length
if(encoding!==undefined){encoding=String(encoding).toLowerCase()
if(encoding==='ucs2'||encoding==='ucs-2'||encoding==='utf16le'||encoding==='utf-16le'){if(arr.length<2||val.length<2){return-1}
indexSize=2
arrLength/=2
valLength/=2
byteOffset/=2}}
function read(buf,i){if(indexSize===1){return buf[i]}else{return buf.readUInt16BE(i*indexSize)}}
var i
if(dir){var foundIndex=-1
for(i=byteOffset;i<arrLength;i++){if(read(arr,i)===read(val,foundIndex===-1?0:i-foundIndex)){if(foundIndex===-1)foundIndex=i
if(i-foundIndex+1===valLength)return foundIndex*indexSize}else{if(foundIndex!==-1)i-=i-foundIndex
foundIndex=-1}}}else{if(byteOffset+valLength>arrLength)byteOffset=arrLength-valLength
for(i=byteOffset;i>=0;i--){var found=!0
for(var j=0;j<valLength;j++){if(read(arr,i+j)!==read(val,j)){found=!1
break}}
if(found)return i}}
return-1}
Buffer.prototype.includes=function includes(val,byteOffset,encoding){return this.indexOf(val,byteOffset,encoding)!==-1}
Buffer.prototype.indexOf=function indexOf(val,byteOffset,encoding){return bidirectionalIndexOf(this,val,byteOffset,encoding,!0)}
Buffer.prototype.lastIndexOf=function lastIndexOf(val,byteOffset,encoding){return bidirectionalIndexOf(this,val,byteOffset,encoding,!1)}
function hexWrite(buf,string,offset,length){offset=Number(offset)||0
var remaining=buf.length-offset
if(!length){length=remaining}else{length=Number(length)
if(length>remaining){length=remaining}}
var strLen=string.length
if(length>strLen/2){length=strLen/2}
for(var i=0;i<length;++i){var parsed=parseInt(string.substr(i*2,2),16)
if(numberIsNaN(parsed))return i
buf[offset+i]=parsed}
return i}
function utf8Write(buf,string,offset,length){return blitBuffer(utf8ToBytes(string,buf.length-offset),buf,offset,length)}
function asciiWrite(buf,string,offset,length){return blitBuffer(asciiToBytes(string),buf,offset,length)}
function latin1Write(buf,string,offset,length){return asciiWrite(buf,string,offset,length)}
function base64Write(buf,string,offset,length){return blitBuffer(base64ToBytes(string),buf,offset,length)}
function ucs2Write(buf,string,offset,length){return blitBuffer(utf16leToBytes(string,buf.length-offset),buf,offset,length)}
Buffer.prototype.write=function write(string,offset,length,encoding){if(offset===undefined){encoding='utf8'
length=this.length
offset=0}else if(length===undefined&&typeof offset==='string'){encoding=offset
length=this.length
offset=0}else if(isFinite(offset)){offset=offset>>>0
if(isFinite(length)){length=length>>>0
if(encoding===undefined)encoding='utf8'}else{encoding=length
length=undefined}}else{throw new Error('Buffer.write(string,encoding,offset[,length]) is no longer supported')}
var remaining=this.length-offset
if(length===undefined||length>remaining)length=remaining
if((string.length>0&&(length<0||offset<0))||offset>this.length){throw new RangeError('Attempt to write outside buffer bounds')}
if(!encoding)encoding='utf8'
var loweredCase=!1
for(;;){switch(encoding){case 'hex':return hexWrite(this,string,offset,length)
case 'utf8':case 'utf-8':return utf8Write(this,string,offset,length)
case 'ascii':return asciiWrite(this,string,offset,length)
case 'latin1':case 'binary':return latin1Write(this,string,offset,length)
case 'base64':return base64Write(this,string,offset,length)
case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':return ucs2Write(this,string,offset,length)
default:if(loweredCase)throw new TypeError('Unknown encoding:'+encoding)
encoding=(''+encoding).toLowerCase()
loweredCase=!0}}}
Buffer.prototype.toJSON=function toJSON(){return{type:'Buffer',data:Array.prototype.slice.call(this._arr||this,0)}}
function base64Slice(buf,start,end){if(start===0&&end===buf.length){return base64.fromByteArray(buf)}else{return base64.fromByteArray(buf.slice(start,end))}}
function utf8Slice(buf,start,end){end=Math.min(buf.length,end)
var res=[]
var i=start
while(i<end){var firstByte=buf[i]
var codePoint=null
var bytesPerSequence=(firstByte>0xEF)?4:(firstByte>0xDF)?3:(firstByte>0xBF)?2:1
if(i+bytesPerSequence<=end){var secondByte,thirdByte,fourthByte,tempCodePoint
switch(bytesPerSequence){case 1:if(firstByte<0x80){codePoint=firstByte}
break
case 2:secondByte=buf[i+1]
if((secondByte&0xC0)===0x80){tempCodePoint=(firstByte&0x1F)<<0x6|(secondByte&0x3F)
if(tempCodePoint>0x7F){codePoint=tempCodePoint}}
break
case 3:secondByte=buf[i+1]
thirdByte=buf[i+2]
if((secondByte&0xC0)===0x80&&(thirdByte&0xC0)===0x80){tempCodePoint=(firstByte&0xF)<<0xC|(secondByte&0x3F)<<0x6|(thirdByte&0x3F)
if(tempCodePoint>0x7FF&&(tempCodePoint<0xD800||tempCodePoint>0xDFFF)){codePoint=tempCodePoint}}
break
case 4:secondByte=buf[i+1]
thirdByte=buf[i+2]
fourthByte=buf[i+3]
if((secondByte&0xC0)===0x80&&(thirdByte&0xC0)===0x80&&(fourthByte&0xC0)===0x80){tempCodePoint=(firstByte&0xF)<<0x12|(secondByte&0x3F)<<0xC|(thirdByte&0x3F)<<0x6|(fourthByte&0x3F)
if(tempCodePoint>0xFFFF&&tempCodePoint<0x110000){codePoint=tempCodePoint}}}}
if(codePoint===null){codePoint=0xFFFD
bytesPerSequence=1}else if(codePoint>0xFFFF){codePoint-=0x10000
res.push(codePoint>>>10&0x3FF|0xD800)
codePoint=0xDC00|codePoint&0x3FF}
res.push(codePoint)
i+=bytesPerSequence}
return decodeCodePointsArray(res)}
var MAX_ARGUMENTS_LENGTH=0x1000
function decodeCodePointsArray(codePoints){var len=codePoints.length
if(len<=MAX_ARGUMENTS_LENGTH){return String.fromCharCode.apply(String,codePoints)}
var res=''
var i=0
while(i<len){res+=String.fromCharCode.apply(String,codePoints.slice(i,i+=MAX_ARGUMENTS_LENGTH))}
return res}
function asciiSlice(buf,start,end){var ret=''
end=Math.min(buf.length,end)
for(var i=start;i<end;++i){ret+=String.fromCharCode(buf[i]&0x7F)}
return ret}
function latin1Slice(buf,start,end){var ret=''
end=Math.min(buf.length,end)
for(var i=start;i<end;++i){ret+=String.fromCharCode(buf[i])}
return ret}
function hexSlice(buf,start,end){var len=buf.length
if(!start||start<0)start=0
if(!end||end<0||end>len)end=len
var out=''
for(var i=start;i<end;++i){out+=toHex(buf[i])}
return out}
function utf16leSlice(buf,start,end){var bytes=buf.slice(start,end)
var res=''
for(var i=0;i<bytes.length;i+=2){res+=String.fromCharCode(bytes[i]+(bytes[i+1]*256))}
return res}
Buffer.prototype.slice=function slice(start,end){var len=this.length
start=~~start
end=end===undefined?len:~~end
if(start<0){start+=len
if(start<0)start=0}else if(start>len){start=len}
if(end<0){end+=len
if(end<0)end=0}else if(end>len){end=len}
if(end<start)end=start
var newBuf=this.subarray(start,end)
newBuf.__proto__=Buffer.prototype
return newBuf}
function checkOffset(offset,ext,length){if((offset%1)!==0||offset<0)throw new RangeError('offset is not uint')if(offset+ext>length)throw new RangeError('Trying to access beyond buffer length')}Buffer.prototype.readUIntLE=function readUIntLE(offset,byteLength,noAssert){offset=offset>>>0 byteLength=byteLength>>>0 if(!noAssert)checkOffset(offset,byteLength,this.length)var val=this[offset]var mul=1 var i=0 while(++i<byteLength&&(mul*=0x100)){val+=this[offset+i]*mul}return val}Buffer.prototype.readUIntBE=function readUIntBE(offset,byteLength,noAssert){offset=offset>>>0 byteLength=byteLength>>>0 if(!noAssert){checkOffset(offset,byteLength,this.length)}var val=this[offset+ --byteLength]var mul=1 while(byteLength>0&&(mul*=0x100)){val+=this[offset+ --byteLength]*mul}return val}Buffer.prototype.readUInt8=function readUInt8(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,1,this.length)return this[offset]}Buffer.prototype.readUInt16LE=function readUInt16LE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,2,this.length)return this[offset]|(this[offset+1]<<8)}Buffer.prototype.readUInt16BE=function readUInt16BE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,2,this.length)return(this[offset]<<8)|this[offset+1]}Buffer.prototype.readUInt32LE=function readUInt32LE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,4,this.length)return((this[offset])|(this[offset+1]<<8)|(this[offset+2]<<16))+(this[offset+3]*0x1000000)}Buffer.prototype.readUInt32BE=function readUInt32BE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,4,this.length)return(this[offset]*0x1000000)+((this[offset+1]<<16)|(this[offset+2]<<8)|this[offset+3])}Buffer.prototype.readIntLE=function readIntLE(offset,byteLength,noAssert){offset=offset>>>0 byteLength=byteLength>>>0 if(!noAssert)checkOffset(offset,byteLength,this.length)var val=this[offset]var mul=1 var i=0 while(++i<byteLength&&(mul*=0x100)){val+=this[offset+i]*mul}mul*=0x80 if(val>=mul)val-=Math.pow(2,8*byteLength)return val}Buffer.prototype.readIntBE=function readIntBE(offset,byteLength,noAssert){offset=offset>>>0 byteLength=byteLength>>>0 if(!noAssert)checkOffset(offset,byteLength,this.length)var i=byteLength var mul=1 var val=this[offset+ --i]while(i>0&&(mul*=0x100)){val+=this[offset+ --i]*mul}mul*=0x80 if(val>=mul)val-=Math.pow(2,8*byteLength)return val}Buffer.prototype.readInt8=function readInt8(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,1,this.length)if(!(this[offset]&0x80))return(this[offset])return((0xff-this[offset]+1)*-1)}Buffer.prototype.readInt16LE=function readInt16LE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,2,this.length)var val=this[offset]|(this[offset+1]<<8)return(val&0x8000)?val|0xFFFF0000:val}Buffer.prototype.readInt16BE=function readInt16BE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,2,this.length)var val=this[offset+1]|(this[offset]<<8)return(val&0x8000)?val|0xFFFF0000:val}Buffer.prototype.readInt32LE=function readInt32LE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,4,this.length)return(this[offset])|(this[offset+1]<<8)|(this[offset+2]<<16)|(this[offset+3]<<24)}Buffer.prototype.readInt32BE=function readInt32BE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,4,this.length)return(this[offset]<<24)|(this[offset+1]<<16)|(this[offset+2]<<8)|(this[offset+3])}Buffer.prototype.readFloatLE=function readFloatLE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,4,this.length)return ieee754.read(this,offset,!0,23,4)}Buffer.prototype.readFloatBE=function readFloatBE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,4,this.length)return ieee754.read(this,offset,!1,23,4)}Buffer.prototype.readDoubleLE=function readDoubleLE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,8,this.length)return ieee754.read(this,offset,!0,52,8)}Buffer.prototype.readDoubleBE=function readDoubleBE(offset,noAssert){offset=offset>>>0 if(!noAssert)checkOffset(offset,8,this.length)return ieee754.read(this,offset,!1,52,8)}function checkInt(buf,value,offset,ext,max,min){if(!Buffer.isBuffer(buf))throw new TypeError('"buffer" argument must be a Buffer instance')if(value>max||value<min)throw new RangeError('"value" argument is out of bounds')if(offset+ext>buf.length)throw new RangeError('Index out of range')}Buffer.prototype.writeUIntLE=function writeUIntLE(value,offset,byteLength,noAssert){value=+value offset=offset>>>0 byteLength=byteLength>>>0 if(!noAssert){var maxBytes=Math.pow(2,8*byteLength)-1 checkInt(this,value,offset,byteLength,maxBytes,0)}var mul=1 var i=0 this[offset]=value&0xFF while(++i<byteLength&&(mul*=0x100)){this[offset+i]=(value/mul)&0xFF}return offset+byteLength}Buffer.prototype.writeUIntBE=function writeUIntBE(value,offset,byteLength,noAssert){value=+value offset=offset>>>0 byteLength=byteLength>>>0 if(!noAssert){var maxBytes=Math.pow(2,8*byteLength)-1 checkInt(this,value,offset,byteLength,maxBytes,0)}var i=byteLength-1 var mul=1 this[offset+i]=value&0xFF while(--i>=0&&(mul*=0x100)){this[offset+i]=(value/mul)&0xFF}return offset+byteLength}Buffer.prototype.writeUInt8=function writeUInt8(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,1,0xff,0)this[offset]=(value&0xff)return offset+1}Buffer.prototype.writeUInt16LE=function writeUInt16LE(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,2,0xffff,0)this[offset]=(value&0xff)this[offset+1]=(value>>>8)return offset+2}Buffer.prototype.writeUInt16BE=function writeUInt16BE(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,2,0xffff,0)this[offset]=(value>>>8)this[offset+1]=(value&0xff)return offset+2}Buffer.prototype.writeUInt32LE=function writeUInt32LE(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,4,0xffffffff,0)this[offset+3]=(value>>>24)this[offset+2]=(value>>>16)this[offset+1]=(value>>>8)this[offset]=(value&0xff)return offset+4}Buffer.prototype.writeUInt32BE=function writeUInt32BE(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,4,0xffffffff,0)this[offset]=(value>>>24)this[offset+1]=(value>>>16)this[offset+2]=(value>>>8)this[offset+3]=(value&0xff)return offset+4}Buffer.prototype.writeIntLE=function writeIntLE(value,offset,byteLength,noAssert){value=+value offset=offset>>>0 if(!noAssert){var limit=Math.pow(2,(8*byteLength)-1)checkInt(this,value,offset,byteLength,limit-1,-limit)}var i=0 var mul=1 var sub=0 this[offset]=value&0xFF while(++i<byteLength&&(mul*=0x100)){if(value<0&&sub===0&&this[offset+i-1]!==0){sub=1}this[offset+i]=((value/mul)>>0)-sub&0xFF}return offset+byteLength}Buffer.prototype.writeIntBE=function writeIntBE(value,offset,byteLength,noAssert){value=+value offset=offset>>>0 if(!noAssert){var limit=Math.pow(2,(8*byteLength)-1)checkInt(this,value,offset,byteLength,limit-1,-limit)}var i=byteLength-1 var mul=1 var sub=0 this[offset+i]=value&0xFF while(--i>=0&&(mul*=0x100)){if(value<0&&sub===0&&this[offset+i+1]!==0){sub=1}this[offset+i]=((value/mul)>>0)-sub&0xFF}return offset+byteLength}Buffer.prototype.writeInt8=function writeInt8(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,1,0x7f,-0x80)if(value<0)value=0xff+value+1 this[offset]=(value&0xff)return offset+1}Buffer.prototype.writeInt16LE=function writeInt16LE(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,2,0x7fff,-0x8000)this[offset]=(value&0xff)this[offset+1]=(value>>>8)return offset+2}Buffer.prototype.writeInt16BE=function writeInt16BE(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,2,0x7fff,-0x8000)this[offset]=(value>>>8)this[offset+1]=(value&0xff)return offset+2}Buffer.prototype.writeInt32LE=function writeInt32LE(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,4,0x7fffffff,-0x80000000)this[offset]=(value&0xff)this[offset+1]=(value>>>8)this[offset+2]=(value>>>16)this[offset+3]=(value>>>24)return offset+4}Buffer.prototype.writeInt32BE=function writeInt32BE(value,offset,noAssert){value=+value offset=offset>>>0 if(!noAssert)checkInt(this,value,offset,4,0x7fffffff,-0x80000000)if(value<0)value=0xffffffff+value+1 this[offset]=(value>>>24)this[offset+1]=(value>>>16)this[offset+2]=(value>>>8)this[offset+3]=(value&0xff)return offset+4}function checkIEEE754(buf,value,offset,ext,max,min){if(offset+ext>buf.length)throw new RangeError('Index out of range')if(offset<0)throw new RangeError('Index out of range')}function writeFloat(buf,value,offset,littleEndian,noAssert){value=+value offset=offset>>>0 if(!noAssert){checkIEEE754(buf,value,offset,4,3.4028234663852886e+38,-3.4028234663852886e+38)}ieee754.write(buf,value,offset,littleEndian,23,4)return offset+4}Buffer.prototype.writeFloatLE=function writeFloatLE(value,offset,noAssert){return writeFloat(this,value,offset,!0,noAssert)}Buffer.prototype.writeFloatBE=function writeFloatBE(value,offset,noAssert){return writeFloat(this,value,offset,!1,noAssert)}function writeDouble(buf,value,offset,littleEndian,noAssert){value=+value offset=offset>>>0 if(!noAssert){checkIEEE754(buf,value,offset,8,1.7976931348623157E+308,-1.7976931348623157E+308)}ieee754.write(buf,value,offset,littleEndian,52,8)return offset+8}Buffer.prototype.writeDoubleLE=function writeDoubleLE(value,offset,noAssert){return writeDouble(this,value,offset,!0,noAssert)}Buffer.prototype.writeDoubleBE=function writeDoubleBE(value,offset,noAssert){return writeDouble(this,value,offset,!1,noAssert)}
if(end===start)return 0
if(target.length===0||this.length===0)return 0
if(targetStart<0){throw new RangeError('targetStart out of bounds')}
if(start<0||start>=this.length)throw new RangeError('Index out of range')
if(end<0)throw new RangeError('sourceEnd out of bounds')
if(end>this.length)end=this.length
if(target.length-targetStart<end-start){end=target.length-targetStart+start}
var len=end-start
if(this===target&&typeof Uint8Array.prototype.copyWithin==='function'){this.copyWithin(targetStart,start,end)}else if(this===target&&start<targetStart&&targetStart<end){for(var i=len-1;i>=0;--i){target[i+targetStart]=this[i+start]}}else{Uint8Array.prototype.set.call(target,this.subarray(start,end),targetStart)}
return len}
Buffer.prototype.fill=function fill(val,start,end,encoding){if(typeof val==='string'){if(typeof start==='string'){encoding=start
start=0
end=this.length}else if(typeof end==='string'){encoding=end
end=this.length}
if(encoding!==undefined&&typeof encoding!=='string'){throw new TypeError('encoding must be a string')}
if(typeof encoding==='string'&&!Buffer.isEncoding(encoding)){throw new TypeError('Unknown encoding:'+encoding)}
if(val.length===1){var code=val.charCodeAt(0)
if((encoding==='utf8'&&code<128)||encoding==='latin1'){val=code}}}else if(typeof val==='number'){val=val&255}
if(start<0||this.length<start||this.length<end){throw new RangeError('Out of range index')}
if(end<=start){return this}
start=start>>>0
end=end===undefined?this.length:end>>>0
if(!val)val=0
var i
if(typeof val==='number'){for(i=start;i<end;++i){this[i]=val}}else{var bytes=Buffer.isBuffer(val)?val:Buffer.from(val,encoding)
var len=bytes.length
if(len===0){throw new TypeError('The value "'+val+'" is invalid for argument "value"')}
for(i=0;i<end-start;++i){this[i+start]=bytes[i%len]}}
return this}
var INVALID_BASE64_RE=/[^+/0-9A-Za-z-_]/g
function base64clean(str){str=str.split('=')[0]
str=str.trim().replace(INVALID_BASE64_RE,'')
if(str.length<2)return''
while(str.length%4!==0){str=str+'='}
return str}
function toHex(n){if(n<16)return'0'+n.toString(16)
return n.toString(16)}
function utf8ToBytes(string,units){units=units||Infinity
var codePoint
var length=string.length
var leadSurrogate=null
var bytes=[]
for(var i=0;i<length;++i){codePoint=string.charCodeAt(i)
if(codePoint>0xD7FF&&codePoint<0xE000){if(!leadSurrogate){if(codePoint>0xDBFF){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD)
continue}else if(i+1===length){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD)
continue}
leadSurrogate=codePoint
continue}
if(codePoint<0xDC00){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD)
leadSurrogate=codePoint
continue}
codePoint=(leadSurrogate-0xD800<<10|codePoint-0xDC00)+0x10000}else if(leadSurrogate){if((units-=3)>-1)bytes.push(0xEF,0xBF,0xBD)}
leadSurrogate=null
if(codePoint<0x80){if((units-=1)<0)break
bytes.push(codePoint)}else if(codePoint<0x800){if((units-=2)<0)break
bytes.push(codePoint>>0x6|0xC0,codePoint&0x3F|0x80)}else if(codePoint<0x10000){if((units-=3)<0)break
bytes.push(codePoint>>0xC|0xE0,codePoint>>0x6&0x3F|0x80,codePoint&0x3F|0x80)}else if(codePoint<0x110000){if((units-=4)<0)break
bytes.push(codePoint>>0x12|0xF0,codePoint>>0xC&0x3F|0x80,codePoint>>0x6&0x3F|0x80,codePoint&0x3F|0x80)}else{throw new Error('Invalid code point')}}
return bytes}
function asciiToBytes(str){var byteArray=[]
for(var i=0;i<str.length;++i){function isArray(arg){if(Array.isArray){return Array.isArray(arg)}
return objectToString(arg)==='[object Array]'}
exports.isArray=isArray;function isBoolean(arg){return typeof arg==='boolean'}
exports.isBoolean=isBoolean;function isNull(arg){return arg===null}
exports.isNull=isNull;function isNullOrUndefined(arg){return arg==null}
exports.isNullOrUndefined=isNullOrUndefined;function isNumber(arg){return typeof arg==='number'}
exports.isNumber=isNumber;function isString(arg){return typeof arg==='string'}
exports.isString=isString;function isSymbol(arg){return typeof arg==='symbol'}
exports.isSymbol=isSymbol;function isUndefined(arg){return arg===void 0}
exports.isUndefined=isUndefined;function isRegExp(re){return objectToString(re)==='[object RegExp]'}
exports.isRegExp=isRegExp;function isObject(arg){return typeof arg==='object'&&arg!==null}
exports.isObject=isObject;function isDate(d){return objectToString(d)==='[object Date]'}
exports.isDate=isDate;function isError(e){return(objectToString(e)==='[object Error]'||e instanceof Error)}
exports.isError=isError;function isFunction(arg){return typeof arg==='function'}
exports.isFunction=isFunction;function isPrimitive(arg){return arg===null||typeof arg==='boolean'||typeof arg==='number'||typeof arg==='string'||typeof arg==='symbol'||typeof arg==='undefined'}
exports.isPrimitive=isPrimitive;exports.isBuffer=Buffer.isBuffer;function objectToString(o){return Object.prototype.toString.call(o)}}).call(this,{"isBuffer":require("../../is-buffer/index.js")})},{"../../is-buffer/index.js":103}],52:[function(require,module,exports){(function(Buffer){var elliptic=require('elliptic')
var BN=require('bn.js')
module.exports=function createECDH(curve){return new ECDH(curve)}
var aliases={secp256k1:{name:'secp256k1',byteLength:32},secp224r1:{name:'p224',byteLength:28},prime256v1:{name:'p256',byteLength:32},prime192v1:{name:'p192',byteLength:24},ed25519:{name:'ed25519',byteLength:32},secp384r1:{name:'p384',byteLength:48},secp521r1:{name:'p521',byteLength:66}}
aliases.p224=aliases.secp224r1
aliases.p256=aliases.secp256r1=aliases.prime256v1
aliases.p192=aliases.secp192r1=aliases.prime192v1
aliases.p384=aliases.secp384r1
aliases.p521=aliases.secp521r1
function ECDH(curve){this.curveType=aliases[curve]
if(!this.curveType){this.curveType={name:curve}}
this.curve=new elliptic.ec(this.curveType.name)
this.keys=void 0}
ECDH.prototype.generateKeys=function(enc,format){this.keys=this.curve.genKeyPair()
return this.getPublicKey(enc,format)}
ECDH.prototype.computeSecret=function(other,inenc,enc){inenc=inenc||'utf8'
if(!Buffer.isBuffer(other)){other=new Buffer(other,inenc)}
var otherPub=this.curve.keyFromPublic(other).getPublic()
var out=otherPub.mul(this.keys.getPrivate()).getX()
return formatReturnValue(out,enc,this.curveType.byteLength)}
ECDH.prototype.getPublicKey=function(enc,format){var key=this.keys.getPublic(format==='compressed',!0)
if(format==='hybrid'){if(key[key.length-1]%2){key[0]=7}else{key[0]=6}}
return formatReturnValue(key,enc)}
ECDH.prototype.getPrivateKey=function(enc){return formatReturnValue(this.keys.getPrivate(),enc)}
ECDH.prototype.setPublicKey=function(pub,enc){enc=enc||'utf8'
if(!Buffer.isBuffer(pub)){pub=new Buffer(pub,enc)}
this.keys._importPublic(pub)
return this}
ECDH.prototype.setPrivateKey=function(priv,enc){enc=enc||'utf8'
if(!Buffer.isBuffer(priv)){priv=new Buffer(priv,enc)}
var _priv=new BN(priv)
_priv=_priv.toString(16)
this.keys=this.curve.genKeyPair()
this.keys._importPrivate(_priv)
return this}
function formatReturnValue(bn,enc,len){if(!Array.isArray(bn)){bn=bn.toArray()}
var buf=new Buffer(bn)
if(len&&buf.length<len){var zeros=new Buffer(len-buf.length)
zeros.fill(0)
buf=Buffer.concat([zeros,buf])}
if(!enc){return buf}else{return buf.toString(enc)}}}).call(this,require("buffer").Buffer)},{"bn.js":17,"buffer":48,"elliptic":68}],53:[function(require,module,exports){'use strict'
var inherits=require('inherits')
var MD5=require('md5.js')
var RIPEMD160=require('ripemd160')
var sha=require('sha.js')
var Base=require('cipher-base')
function Hash(hash){Base.call(this,'digest')
this._hash=hash}
inherits(Hash,Base)
Hash.prototype._update=function(data){this._hash.update(data)}
Hash.prototype._final=function(){return this._hash.digest()}
module.exports=function createHash(alg){alg=alg.toLowerCase()
if(alg==='md5')return new MD5()
if(alg==='rmd160'||alg==='ripemd160')return new RIPEMD160()
return new Hash(sha(alg))}},{"cipher-base":50,"inherits":102,"md5.js":105,"ripemd160":147,"sha.js":150}],54:[function(require,module,exports){var MD5=require('md5.js')
module.exports=function(buffer){return new MD5().update(buffer).digest()}},{"md5.js":105}],55:[function(require,module,exports){'use strict'
var inherits=require('inherits')
var Legacy=require('./legacy')
var Base=require('cipher-base')
var Buffer=require('safe-buffer').Buffer
var md5=require('create-hash/md5')
var RIPEMD160=require('ripemd160')
var sha=require('sha.js')
var ZEROS=Buffer.alloc(128)
function Hmac(alg,key){Base.call(this,'digest')
if(typeof key==='string'){key=Buffer.from(key)}
var blocksize=(alg==='sha512'||alg==='sha384')?128:64
this._alg=alg
this._key=key
if(key.length>blocksize){var hash=alg==='rmd160'?new RIPEMD160():sha(alg)
key=hash.update(key).digest()}else if(key.length<blocksize){key=Buffer.concat([key,ZEROS],blocksize)}
var ipad=this._ipad=Buffer.allocUnsafe(blocksize)
var opad=this._opad=Buffer.allocUnsafe(blocksize)
for(var i=0;i<blocksize;i++){ipad[i]=key[i]^0x36
opad[i]=key[i]^0x5C}
this._hash=alg==='rmd160'?new RIPEMD160():sha(alg)
this._hash.update(ipad)}
inherits(Hmac,Base)
Hmac.prototype._update=function(data){this._hash.update(data)}
Hmac.prototype._final=function(){var h=this._hash.digest()
var hash=this._alg==='rmd160'?new RIPEMD160():sha(this._alg)
return hash.update(this._opad).update(h).digest()}
module.exports=function createHmac(alg,key){alg=alg.toLowerCase()
if(alg==='rmd160'||alg==='ripemd160'){return new Hmac('rmd160',key)}
if(alg==='md5'){return new Legacy(md5,key)}
return new Hmac(alg,key)}},{"./legacy":56,"cipher-base":50,"create-hash/md5":54,"inherits":102,"ripemd160":147,"safe-buffer":148,"sha.js":150}],56:[function(require,module,exports){'use strict'
var inherits=require('inherits')
var Buffer=require('safe-buffer').Buffer
var Base=require('cipher-base')
var ZEROS=Buffer.alloc(128)
var blocksize=64
function Hmac(alg,key){Base.call(this,'digest')
if(typeof key==='string'){key=Buffer.from(key)}
this._alg=alg
this._key=key
if(key.length>blocksize){key=alg(key)}else if(key.length<blocksize){key=Buffer.concat([key,ZEROS],blocksize)}
var ipad=this._ipad=Buffer.allocUnsafe(blocksize)
var opad=this._opad=Buffer.allocUnsafe(blocksize)
for(var i=0;i<blocksize;i++){ipad[i]=key[i]^0x36
opad[i]=key[i]^0x5C}
this._hash=[ipad]}
inherits(Hmac,Base)
Hmac.prototype._update=function(data){this._hash.push(data)}
Hmac.prototype._final=function(){var h=this._alg(Buffer.concat(this._hash))
return this._alg(Buffer.concat([this._opad,h]))}
module.exports=Hmac},{"cipher-base":50,"inherits":102,"safe-buffer":148}],57:[function(require,module,exports){'use strict'
exports.randomBytes=exports.rng=exports.pseudoRandomBytes=exports.prng=require('randombytes')
exports.createHash=exports.Hash=require('create-hash')
exports.createHmac=exports.Hmac=require('create-hmac')
var algos=require('browserify-sign/algos')
var algoKeys=Object.keys(algos)
var hashes=['sha1','sha224','sha256','sha384','sha512','md5','rmd160'].concat(algoKeys)
exports.getHashes=function(){return hashes}
var p=require('pbkdf2')
exports.pbkdf2=p.pbkdf2
exports.pbkdf2Sync=p.pbkdf2Sync
var aes=require('browserify-cipher')
exports.Cipher=aes.Cipher
exports.createCipher=aes.createCipher
exports.Cipheriv=aes.Cipheriv
exports.createCipheriv=aes.createCipheriv
exports.Decipher=aes.Decipher
exports.createDecipher=aes.createDecipher
exports.Decipheriv=aes.Decipheriv
exports.createDecipheriv=aes.createDecipheriv
exports.getCiphers=aes.getCiphers
exports.listCiphers=aes.listCiphers
var dh=require('diffie-hellman')
exports.DiffieHellmanGroup=dh.DiffieHellmanGroup
exports.createDiffieHellmanGroup=dh.createDiffieHellmanGroup
exports.getDiffieHellman=dh.getDiffieHellman
exports.createDiffieHellman=dh.createDiffieHellman
exports.DiffieHellman=dh.DiffieHellman
var sign=require('browserify-sign')
exports.createSign=sign.createSign
exports.Sign=sign.Sign
exports.createVerify=sign.createVerify
exports.Verify=sign.Verify
exports.createECDH=require('create-ecdh')
var publicEncrypt=require('public-encrypt')
exports.publicEncrypt=publicEncrypt.publicEncrypt
exports.privateEncrypt=publicEncrypt.privateEncrypt
exports.publicDecrypt=publicEncrypt.publicDecrypt
exports.privateDecrypt=publicEncrypt.privateDecrypt
var rf=require('randomfill')
exports.randomFill=rf.randomFill
exports.randomFillSync=rf.randomFillSync
exports.createCredentials=function(){throw new Error(['sorry,createCredentials is not implemented yet','we accept pull requests','https://github.com/crypto-browserify/crypto-browserify'].join('\n'))}
exports.constants={'DH_CHECK_P_NOT_SAFE_PRIME':2,'DH_CHECK_P_NOT_PRIME':1,'DH_UNABLE_TO_CHECK_GENERATOR':4,'DH_NOT_SUITABLE_GENERATOR':8,'NPN_ENABLED':1,'ALPN_ENABLED':1,'RSA_PKCS1_PADDING':1,'RSA_SSLV23_PADDING':2,'RSA_NO_PADDING':3,'RSA_PKCS1_OAEP_PADDING':4,'RSA_X931_PADDING':5,'RSA_PKCS1_PSS_PADDING':6,'POINT_CONVERSION_COMPRESSED':2,'POINT_CONVERSION_UNCOMPRESSED':4,'POINT_CONVERSION_HYBRID':6}},{"browserify-cipher":37,"browserify-sign":44,"browserify-sign/algos":41,"create-ecdh":52,"create-hash":53,"create-hmac":55,"diffie-hellman":64,"pbkdf2":115,"public-encrypt":122,"randombytes":132,"randomfill":133}],58:[function(require,module,exports){'use strict';exports.utils=require('./des/utils');exports.Cipher=require('./des/cipher');exports.DES=require('./des/des');exports.CBC=require('./des/cbc');exports.EDE=require('./des/ede')},{"./des/cbc":59,"./des/cipher":60,"./des/des":61,"./des/ede":62,"./des/utils":63}],59:[function(require,module,exports){'use strict';var assert=require('minimalistic-assert');var inherits=require('inherits');var proto={};function CBCState(iv){assert.equal(iv.length,8,'Invalid IV length');this.iv=new Array(8);for(var i=0;i<this.iv.length;i++)
this.iv[i]=iv[i]}
function instantiate(Base){function CBC(options){Base.call(this,options);this._cbcInit()}
inherits(CBC,Base);var keys=Object.keys(proto);for(var i=0;i<keys.length;i++){var key=keys[i];CBC.prototype[key]=proto[key]}
CBC.create=function create(options){return new CBC(options)};return CBC}
exports.instantiate=instantiate;proto._cbcInit=function _cbcInit(){var state=new CBCState(this.options.iv);this._cbcState=state};proto._update=function _update(inp,inOff,out,outOff){var state=this._cbcState;var superProto=this.constructor.super_.prototype;var iv=state.iv;if(this.type==='encrypt'){for(var i=0;i<this.blockSize;i++)
iv[i]^=inp[inOff+i];superProto._update.call(this,iv,0,out,outOff);for(var i=0;i<this.blockSize;i++)
iv[i]=out[outOff+i]}else{superProto._update.call(this,inp,inOff,out,outOff);for(var i=0;i<this.blockSize;i++)
out[outOff+i]^=iv[i];for(var i=0;i<this.blockSize;i++)
iv[i]=inp[inOff+i]}}},{"inherits":102,"minimalistic-assert":107}],60:[function(require,module,exports){'use strict';var assert=require('minimalistic-assert');function Cipher(options){this.options=options;this.type=this.options.type;this.blockSize=8;this._init();this.buffer=new Array(this.blockSize);this.bufferOff=0}
module.exports=Cipher;Cipher.prototype._init=function _init(){};Cipher.prototype.update=function update(data){if(data.length===0)
return[];if(this.type==='decrypt')
return this._updateDecrypt(data);else return this._updateEncrypt(data)};Cipher.prototype._buffer=function _buffer(data,off){var min=Math.min(this.buffer.length-this.bufferOff,data.length-off);for(var i=0;i<min;i++)
this.buffer[this.bufferOff+i]=data[off+i];this.bufferOff+=min;return min};Cipher.prototype._flushBuffer=function _flushBuffer(out,off){this._update(this.buffer,0,out,off);this.bufferOff=0;return this.blockSize};Cipher.prototype._updateEncrypt=function _updateEncrypt(data){var inputOff=0;var outputOff=0;var count=((this.bufferOff+data.length)/this.blockSize)|0;var out=new Array(count*this.blockSize);if(this.bufferOff!==0){inputOff+=this._buffer(data,inputOff);if(this.bufferOff===this.buffer.length)
outputOff+=this._flushBuffer(out,outputOff)}
var max=data.length-((data.length-inputOff)%this.blockSize);for(;inputOff<max;inputOff+=this.blockSize){this._update(data,inputOff,out,outputOff);outputOff+=this.blockSize}
for(;inputOff<data.length;inputOff++,this.bufferOff++)
this.buffer[this.bufferOff]=data[inputOff];return out};Cipher.prototype._updateDecrypt=function _updateDecrypt(data){var inputOff=0;var outputOff=0;var count=Math.ceil((this.bufferOff+data.length)/this.blockSize)-1;var out=new Array(count*this.blockSize);for(;count>0;count--){inputOff+=this._buffer(data,inputOff);outputOff+=this._flushBuffer(out,outputOff)}
inputOff+=this._buffer(data,inputOff);return out};Cipher.prototype.final=function final(buffer){var first;if(buffer)
first=this.update(buffer);var last;if(this.type==='encrypt')
last=this._finalEncrypt();else last=this._finalDecrypt();if(first)
return first.concat(last);else return last};Cipher.prototype._pad=function _pad(buffer,off){if(off===0)
return!1;while(off<buffer.length)
buffer[off++]=0;return!0};Cipher.prototype._finalEncrypt=function _finalEncrypt(){if(!this._pad(this.buffer,this.bufferOff))
return[];var out=new Array(this.blockSize);this._update(this.buffer,0,out,0);return out};Cipher.prototype._unpad=function _unpad(buffer){return buffer};Cipher.prototype._finalDecrypt=function _finalDecrypt(){assert.equal(this.bufferOff,this.blockSize,'Not enough data to decrypt');var out=new Array(this.blockSize);this._flushBuffer(out,0);return this._unpad(out)}},{"minimalistic-assert":107}],61:[function(require,module,exports){'use strict';var assert=require('minimalistic-assert');var inherits=require('inherits');var des=require('../des');var utils=des.utils;var Cipher=des.Cipher;function DESState(){this.tmp=new Array(2);this.keys=null}
function DES(options){Cipher.call(this,options);var state=new DESState();this._desState=state;this.deriveKeys(state,options.key)}
inherits(DES,Cipher);module.exports=DES;DES.create=function create(options){return new DES(options)};var shiftTable=[1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];DES.prototype.deriveKeys=function deriveKeys(state,key){state.keys=new Array(16*2);assert.equal(key.length,this.blockSize,'Invalid key length');var kL=utils.readUInt32BE(key,0);var kR=utils.readUInt32BE(key,4);utils.pc1(kL,kR,state.tmp,0);kL=state.tmp[0];kR=state.tmp[1];for(var i=0;i<state.keys.length;i+=2){var shift=shiftTable[i>>>1];kL=utils.r28shl(kL,shift);kR=utils.r28shl(kR,shift);utils.pc2(kL,kR,state.keys,i)}};DES.prototype._update=function _update(inp,inOff,out,outOff){var state=this._desState;var l=utils.readUInt32BE(inp,inOff);var r=utils.readUInt32BE(inp,inOff+4);utils.ip(l,r,state.tmp,0);l=state.tmp[0];r=state.tmp[1];if(this.type==='encrypt')
this._encrypt(state,l,r,state.tmp,0);else this._decrypt(state,l,r,state.tmp,0);l=state.tmp[0];r=state.tmp[1];utils.writeUInt32BE(out,l,outOff);utils.writeUInt32BE(out,r,outOff+4)};DES.prototype._pad=function _pad(buffer,off){var value=buffer.length-off;for(var i=off;i<buffer.length;i++)
buffer[i]=value;return!0};DES.prototype._unpad=function _unpad(buffer){var pad=buffer[buffer.length-1];for(var i=buffer.length-pad;i<buffer.length;i++)
assert.equal(buffer[i],pad);return buffer.slice(0,buffer.length-pad)};DES.prototype._encrypt=function _encrypt(state,lStart,rStart,out,off){var l=lStart;var r=rStart;for(var i=0;i<state.keys.length;i+=2){var keyL=state.keys[i];var keyR=state.keys[i+1];utils.expand(r,state.tmp,0);keyL^=state.tmp[0];keyR^=state.tmp[1];var s=utils.substitute(keyL,keyR);var f=utils.permute(s);var t=r;r=(l^f)>>>0;l=t}
utils.rip(r,l,out,off)};DES.prototype._decrypt=function _decrypt(state,lStart,rStart,out,off){var l=rStart;var r=lStart;for(var i=state.keys.length-2;i>=0;i-=2){var keyL=state.keys[i];var keyR=state.keys[i+1];utils.expand(l,state.tmp,0);keyL^=state.tmp[0];keyR^=state.tmp[1];var s=utils.substitute(keyL,keyR);var f=utils.permute(s);var t=l;l=(r^f)>>>0;r=t}
utils.rip(l,r,out,off)}},{"../des":58,"inherits":102,"minimalistic-assert":107}],62:[function(require,module,exports){'use strict';var assert=require('minimalistic-assert');var inherits=require('inherits');var des=require('../des');var Cipher=des.Cipher;var DES=des.DES;function EDEState(type,key){assert.equal(key.length,24,'Invalid key length');var k1=key.slice(0,8);var k2=key.slice(8,16);var k3=key.slice(16,24);if(type==='encrypt'){this.ciphers=[DES.create({type:'encrypt',key:k1}),DES.create({type:'decrypt',key:k2}),DES.create({type:'encrypt',key:k3})]}else{this.ciphers=[DES.create({type:'decrypt',key:k3}),DES.create({type:'encrypt',key:k2}),DES.create({type:'decrypt',key:k1})]}}
function EDE(options){Cipher.call(this,options);var state=new EDEState(this.type,this.options.key);this._edeState=state}
inherits(EDE,Cipher);module.exports=EDE;EDE.create=function create(options){return new EDE(options)};EDE.prototype._update=function _update(inp,inOff,out,outOff){var state=this._edeState;state.ciphers[0]._update(inp,inOff,out,outOff);state.ciphers[1]._update(out,outOff,out,outOff);state.ciphers[2]._update(out,outOff,out,outOff)};EDE.prototype._pad=DES.prototype._pad;EDE.prototype._unpad=DES.prototype._unpad},{"../des":58,"inherits":102,"minimalistic-assert":107}],63:[function(require,module,exports){'use strict';exports.readUInt32BE=function readUInt32BE(bytes,off){var res=(bytes[0+off]<<24)|(bytes[1+off]<<16)|(bytes[2+off]<<8)|bytes[3+off];return res>>>0};exports.writeUInt32BE=function writeUInt32BE(bytes,value,off){bytes[0+off]=value>>>24;bytes[1+off]=(value>>>16)&0xff;bytes[2+off]=(value>>>8)&0xff;bytes[3+off]=value&0xff};exports.ip=function ip(inL,inR,out,off){var outL=0;var outR=0;for(var i=6;i>=0;i-=2){for(var j=0;j<=24;j+=8){outL<<=1;outL|=(inR>>>(j+i))&1}
for(var j=0;j<=24;j+=8){outL<<=1;outL|=(inL>>>(j+i))&1}}
for(var i=6;i>=0;i-=2){for(var j=1;j<=25;j+=8){outR<<=1;outR|=(inR>>>(j+i))&1}
for(var j=1;j<=25;j+=8){outR<<=1;outR|=(inL>>>(j+i))&1}}
out[off+0]=outL>>>0;out[off+1]=outR>>>0};exports.rip=function rip(inL,inR,out,off){var outL=0;var outR=0;for(var i=0;i<4;i++){for(var j=24;j>=0;j-=8){outL<<=1;outL|=(inR>>>(j+i))&1;outL<<=1;outL|=(inL>>>(j+i))&1}}
for(var i=4;i<8;i++){for(var j=24;j>=0;j-=8){outR<<=1;outR|=(inR>>>(j+i))&1;outR<<=1;outR|=(inL>>>(j+i))&1}}
out[off+0]=outL>>>0;out[off+1]=outR>>>0};exports.pc1=function pc1(inL,inR,out,off){var outL=0;var outR=0;for(var i=7;i>=5;i--){for(var j=0;j<=24;j+=8){outL<<=1;outL|=(inR>>(j+i))&1}
for(var j=0;j<=24;j+=8){outL<<=1;outL|=(inL>>(j+i))&1}}
for(var j=0;j<=24;j+=8){outL<<=1;outL|=(inR>>(j+i))&1}
for(var i=1;i<=3;i++){for(var j=0;j<=24;j+=8){outR<<=1;outR|=(inR>>(j+i))&1}
for(var j=0;j<=24;j+=8){outR<<=1;outR|=(inL>>(j+i))&1}}
for(var j=0;j<=24;j+=8){outR<<=1;outR|=(inL>>(j+i))&1}
out[off+0]=outL>>>0;out[off+1]=outR>>>0};exports.r28shl=function r28shl(num,shift){return((num<<shift)&0xfffffff)|(num>>>(28-shift))};var pc2table=[14,11,17,4,27,23,25,0,13,22,7,18,5,9,16,24,2,20,12,21,1,8,15,26,15,4,25,19,9,1,26,16,5,11,23,8,12,7,17,0,22,3,10,14,6,20,27,24];exports.pc2=function pc2(inL,inR,out,off){var outL=0;var outR=0;var len=pc2table.length>>>1;for(var i=0;i<len;i++){outL<<=1;outL|=(inL>>>pc2table[i])&0x1}
for(var i=len;i<pc2table.length;i++){outR<<=1;outR|=(inR>>>pc2table[i])&0x1}
out[off+0]=outL>>>0;out[off+1]=outR>>>0};exports.expand=function expand(r,out,off){var outL=0;var outR=0;outL=((r&1)<<5)|(r>>>27);for(var i=23;i>=15;i-=4){outL<<=6;outL|=(r>>>i)&0x3f}
for(var i=11;i>=3;i-=4){outR|=(r>>>i)&0x3f;outR<<=6}
outR|=((r&0x1f)<<1)|(r>>>31);out[off+0]=outL>>>0;out[off+1]=outR>>>0};var sTable=[14,0,4,15,13,7,1,4,2,14,15,2,11,13,8,1,3,10,10,6,6,12,12,11,5,9,9,5,0,3,7,8,4,15,1,12,14,8,8,2,13,4,6,9,2,1,11,7,15,5,12,11,9,3,7,14,3,10,10,0,5,6,0,13,15,3,1,13,8,4,14,7,6,15,11,2,3,8,4,14,9,12,7,0,2,1,13,10,12,6,0,9,5,11,10,5,0,13,14,8,7,10,11,1,10,3,4,15,13,4,1,2,5,11,8,6,12,7,6,12,9,0,3,5,2,14,15,9,10,13,0,7,9,0,14,9,6,3,3,4,15,6,5,10,1,2,13,8,12,5,7,14,11,12,4,11,2,15,8,1,13,1,6,10,4,13,9,0,8,6,15,9,3,8,0,7,11,4,1,15,2,14,12,3,5,11,10,5,14,2,7,12,7,13,13,8,14,11,3,5,0,6,6,15,9,0,10,3,1,4,2,7,8,2,5,12,11,1,12,10,4,14,15,9,10,3,6,15,9,0,0,6,12,10,11,1,7,13,13,8,15,9,1,4,3,5,14,11,5,12,2,7,8,2,4,14,2,14,12,11,4,2,1,12,7,4,10,7,11,13,6,1,8,5,5,0,3,15,15,10,13,3,0,9,14,8,9,6,4,11,2,8,1,12,11,7,10,1,13,14,7,2,8,13,15,6,9,15,12,0,5,9,6,10,3,4,0,5,14,3,12,10,1,15,10,4,15,2,9,7,2,12,6,9,8,5,0,6,13,1,3,13,4,14,14,0,7,11,5,3,11,8,9,4,14,3,15,2,5,12,2,9,8,5,12,15,3,10,7,11,0,14,4,1,10,7,1,6,13,0,11,8,6,13,4,13,11,0,2,11,14,7,15,4,0,9,8,1,13,10,3,14,12,3,9,5,7,12,5,2,10,15,6,8,1,6,1,6,4,11,11,13,13,8,12,1,3,4,7,10,14,7,10,9,15,5,6,0,8,15,0,14,5,2,9,3,2,12,13,1,2,15,8,13,4,8,6,10,15,3,11,7,1,4,10,12,9,5,3,6,14,11,5,0,0,14,12,9,7,2,7,2,11,1,4,14,1,7,9,4,12,10,14,8,2,13,0,15,6,12,10,9,13,0,15,3,3,5,5,6,8,11];exports.substitute=function substitute(inL,inR){var out=0;for(var i=0;i<4;i++){var b=(inL>>>(18-i*6))&0x3f;var sb=sTable[i*0x40+b];out<<=4;out|=sb}
for(var i=0;i<4;i++){var b=(inR>>>(18-i*6))&0x3f;var sb=sTable[4*0x40+i*0x40+b];out<<=4;out|=sb}
return out>>>0};var permuteTable=[16,25,12,11,3,20,4,15,31,17,9,6,27,14,1,22,30,24,8,18,0,5,29,23,13,19,2,26,10,21,28,7];exports.permute=function permute(num){var out=0;for(var i=0;i<permuteTable.length;i++){out<<=1;out|=(num>>>permuteTable[i])&0x1}
return out>>>0};exports.padSplit=function padSplit(num,size,group){var str=num.toString(2);while(str.length<size)
str='0'+str;var out=[];for(var i=0;i<size;i+=group)
out.push(str.slice(i,i+group));return out.join(' ')}},{}],64:[function(require,module,exports){(function(Buffer){var generatePrime=require('./lib/generatePrime')
var primes=require('./lib/primes.json')
var DH=require('./lib/dh')
function getDiffieHellman(mod){var prime=new Buffer(primes[mod].prime,'hex')
var gen=new Buffer(primes[mod].gen,'hex')
return new DH(prime,gen)}
var ENCODINGS={'binary':!0,'hex':!0,'base64':!0}
function createDiffieHellman(prime,enc,generator,genc){if(Buffer.isBuffer(enc)||ENCODINGS[enc]===undefined){return createDiffieHellman(prime,'binary',enc,generator)}
enc=enc||'binary'
genc=genc||'binary'
generator=generator||new Buffer([2])
if(!Buffer.isBuffer(generator)){generator=new Buffer(generator,genc)}
if(typeof prime==='number'){return new DH(generatePrime(prime,generator),generator,!0)}
if(!Buffer.isBuffer(prime)){prime=new Buffer(prime,enc)}
return new DH(prime,generator,!0)}
exports.DiffieHellmanGroup=exports.createDiffieHellmanGroup=exports.getDiffieHellman=getDiffieHellman
exports.createDiffieHellman=exports.DiffieHellman=createDiffieHellman}).call(this,require("buffer").Buffer)},{"./lib/dh":65,"./lib/generatePrime":66,"./lib/primes.json":67,"buffer":48}],65:[function(require,module,exports){(function(Buffer){var BN=require('bn.js');var MillerRabin=require('miller-rabin');var millerRabin=new MillerRabin();var TWENTYFOUR=new BN(24);var ELEVEN=new BN(11);var TEN=new BN(10);var THREE=new BN(3);var SEVEN=new BN(7);var primes=require('./generatePrime');var randomBytes=require('randombytes');module.exports=DH;function setPublicKey(pub,enc){enc=enc||'utf8';if(!Buffer.isBuffer(pub)){pub=new Buffer(pub,enc)}
this._pub=new BN(pub);return this}
function setPrivateKey(priv,enc){enc=enc||'utf8';if(!Buffer.isBuffer(priv)){priv=new Buffer(priv,enc)}
this._priv=new BN(priv);return this}
var primeCache={};function checkPrime(prime,generator){var gen=generator.toString('hex');var hex=[gen,prime.toString(16)].join('_');if(hex in primeCache){return primeCache[hex]}
var error=0;if(prime.isEven()||!primes.simpleSieve||!primes.fermatTest(prime)||!millerRabin.test(prime)){error+=1;if(gen==='02'||gen==='05'){error+=4}
primeCache[hex]=error;return error}
if(!millerRabin.test(prime.shrn(1))){error+=2}
var rem;switch(gen){case '02':if(prime.mod(TWENTYFOUR).cmp(ELEVEN)){error+=8}
break;case '05':rem=prime.mod(TEN);if(rem.cmp(THREE)&&rem.cmp(SEVEN)){error+=8}
break;default:error+=4}
primeCache[hex]=error;return error}
function DH(prime,generator,malleable){this.setGenerator(generator);this.__prime=new BN(prime);this._prime=BN.mont(this.__prime);this._primeLen=prime.length;this._pub=undefined;this._priv=undefined;this._primeCode=undefined;if(malleable){this.setPublicKey=setPublicKey;this.setPrivateKey=setPrivateKey}else{this._primeCode=8}}
Object.defineProperty(DH.prototype,'verifyError',{enumerable:!0,get:function(){if(typeof this._primeCode!=='number'){this._primeCode=checkPrime(this.__prime,this.__gen)}
return this._primeCode}});DH.prototype.generateKeys=function(){if(!this._priv){this._priv=new BN(randomBytes(this._primeLen))}
this._pub=this._gen.toRed(this._prime).redPow(this._priv).fromRed();return this.getPublicKey()};DH.prototype.computeSecret=function(other){other=new BN(other);other=other.toRed(this._prime);var secret=other.redPow(this._priv).fromRed();var out=new Buffer(secret.toArray());var prime=this.getPrime();if(out.length<prime.length){var front=new Buffer(prime.length-out.length);front.fill(0);out=Buffer.concat([front,out])}
return out};DH.prototype.getPublicKey=function getPublicKey(enc){return formatReturnValue(this._pub,enc)};DH.prototype.getPrivateKey=function getPrivateKey(enc){return formatReturnValue(this._priv,enc)};DH.prototype.getPrime=function(enc){return formatReturnValue(this.__prime,enc)};DH.prototype.getGenerator=function(enc){return formatReturnValue(this._gen,enc)};DH.prototype.setGenerator=function(gen,enc){enc=enc||'utf8';if(!Buffer.isBuffer(gen)){gen=new Buffer(gen,enc)}
this.__gen=gen;this._gen=new BN(gen);return this};function formatReturnValue(bn,enc){var buf=new Buffer(bn.toArray());if(!enc){return buf}else{return buf.toString(enc)}}}).call(this,require("buffer").Buffer)},{"./generatePrime":66,"bn.js":17,"buffer":48,"miller-rabin":106,"randombytes":132}],66:[function(require,module,exports){var randomBytes=require('randombytes');module.exports=findPrime;findPrime.simpleSieve=simpleSieve;findPrime.fermatTest=fermatTest;var BN=require('bn.js');var TWENTYFOUR=new BN(24);var MillerRabin=require('miller-rabin');var millerRabin=new MillerRabin();var ONE=new BN(1);var TWO=new BN(2);var FIVE=new BN(5);var SIXTEEN=new BN(16);var EIGHT=new BN(8);var TEN=new BN(10);var THREE=new BN(3);var SEVEN=new BN(7);var ELEVEN=new BN(11);var FOUR=new BN(4);var TWELVE=new BN(12);var primes=null;function _getPrimes(){if(primes!==null)
return primes;var limit=0x100000;var res=[];res[0]=2;for(var i=1,k=3;k<limit;k+=2){var sqrt=Math.ceil(Math.sqrt(k));for(var j=0;j<i&&res[j]<=sqrt;j++)
if(k%res[j]===0)
break;if(i!==j&&res[j]<=sqrt)
continue;res[i++]=k}
primes=res;return res}
function simpleSieve(p){var primes=_getPrimes();for(var i=0;i<primes.length;i++)
if(p.modn(primes[i])===0){if(p.cmpn(primes[i])===0){return!0}else{return!1}}
return!0}
function fermatTest(p){var red=BN.mont(p);return TWO.toRed(red).redPow(p.subn(1)).fromRed().cmpn(1)===0}
function findPrime(bits,gen){if(bits<16){if(gen===2||gen===5){return new BN([0x8c,0x7b])}else{return new BN([0x8c,0x27])}}
gen=new BN(gen);var num,n2;while(!0){num=new BN(randomBytes(Math.ceil(bits/8)));while(num.bitLength()>bits){num.ishrn(1)}
if(num.isEven()){num.iadd(ONE)}
if(!num.testn(1)){num.iadd(TWO)}
if(!gen.cmp(TWO)){while(num.mod(TWENTYFOUR).cmp(ELEVEN)){num.iadd(FOUR)}}else if(!gen.cmp(FIVE)){while(num.mod(TEN).cmp(THREE)){num.iadd(FOUR)}}
n2=num.shrn(1);if(simpleSieve(n2)&&simpleSieve(num)&&fermatTest(n2)&&fermatTest(num)&&millerRabin.test(n2)&&millerRabin.test(num)){return num}}}},{"bn.js":17,"miller-rabin":106,"randombytes":132}],67:[function(require,module,exports){module.exports={"modp1":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a63a3620ffffffffffffffff"},"modp2":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece65381ffffffffffffffff"},"modp5":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff"},"modp14":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aacaa68ffffffffffffffff"},"modp15":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a93ad2caffffffffffffffff"},"modp16":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c934063199ffffffffffffffff"},"modp17":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dcc4024ffffffffffffffff"},"modp18":{"gen":"02","prime":"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dbe115974a3926f12fee5e438777cb6a932df8cd8bec4d073b931ba3bc832b68d9dd300741fa7bf8afc47ed2576f6936ba424663aab639c5ae4f5683423b4742bf1c978238f16cbe39d652de3fdb8befc848ad922222e04a4037c0713eb57a81a23f0c73473fc646cea306b4bcbc8862f8385ddfa9d4b7fa2c087e879683303ed5bdd3a062b3cf5b3a278a66d2a13f83f44f82ddf310ee074ab6a364597e899a0255dc164f31cc50846851df9ab48195ded7ea1b1d510bd7ee74d73faf36bc31ecfa268359046f4eb879f924009438b481c6cd7889a002ed5ee382bc9190da6fc026e479558e4475677e9aa9e3050e2765694dfc81f56e880b96e7160c980dd98edd3dfffffffffffffffff"}}},{}],68:[function(require,module,exports){'use strict';var elliptic=exports;elliptic.version=require('../package.json').version;elliptic.utils=require('./elliptic/utils');elliptic.rand=require('brorand');elliptic.curve=require('./elliptic/curve');elliptic.curves=require('./elliptic/curves');elliptic.ec=require('./elliptic/ec');elliptic.eddsa=require('./elliptic/eddsa')},{"../package.json":83,"./elliptic/curve":71,"./elliptic/curves":74,"./elliptic/ec":75,"./elliptic/eddsa":78,"./elliptic/utils":82,"brorand":18}],69:[function(require,module,exports){'use strict';var BN=require('bn.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;var getNAF=utils.getNAF;var getJSF=utils.getJSF;var assert=utils.assert;function BaseCurve(type,conf){this.type=type;this.p=new BN(conf.p,16);this.red=conf.prime?BN.red(conf.prime):BN.mont(this.p);this.zero=new BN(0).toRed(this.red);this.one=new BN(1).toRed(this.red);this.two=new BN(2).toRed(this.red);this.n=conf.n&&new BN(conf.n,16);this.g=conf.g&&this.pointFromJSON(conf.g,conf.gRed);this._wnafT1=new Array(4);this._wnafT2=new Array(4);this._wnafT3=new Array(4);this._wnafT4=new Array(4);var p=this.g.jmulAdd(u1,key.getPublic(),u2);if(p.isInfinity())
return!1;return p.eqXToP(r)};EC.prototype.recoverPubKey=function(msg,signature,j,enc){assert((3&j)===j,'The recovery param is more than two bits');signature=new Signature(signature,enc);var n=this.n;var e=new BN(msg);var r=signature.r;var s=signature.s;var isYOdd=j&1;var isSecondKey=j>>1;if(r.cmp(this.curve.p.umod(this.curve.n))>=0&&isSecondKey)
throw new Error('Unable to find sencond key candinate');if(isSecondKey)
r=this.curve.pointFromX(r.add(this.curve.n),isYOdd);else r=this.curve.pointFromX(r,isYOdd);var rInv=signature.r.invm(n);var s1=n.sub(e).mul(rInv).umod(n);var s2=s.mul(rInv).umod(n);return this.g.mulAdd(s1,r,s2)};EC.prototype.getKeyRecoveryParam=function(e,signature,Q,enc){signature=new Signature(signature,enc);if(signature.recoveryParam!==null)
return signature.recoveryParam;for(var i=0;i<4;i++){var Qprime;try{Qprime=this.recoverPubKey(e,signature,i)}catch(e){continue}
if(Qprime.eq(Q))
return i}
throw new Error('Unable to find valid recovery factor')}},{"../../elliptic":68,"./key":76,"./signature":77,"bn.js":17,"hmac-drbg":99}],76:[function(require,module,exports){'use strict';var BN=require('bn.js');var elliptic=require('../../elliptic');var utils=elliptic.utils;var assert=utils.assert;function KeyPair(ec,options){this.ec=ec;this.priv=null;this.pub=null;if(options.priv)
this._importPrivate(options.priv,options.privEnc);if(options.pub)
this._importPublic(options.pub,options.pubEnc)}
module.exports=KeyPair;KeyPair.fromPublic=function fromPublic(ec,pub,enc){if(pub instanceof KeyPair)
return pub;return new KeyPair(ec,{pub:pub,pubEnc:enc})};KeyPair.fromPrivate=function fromPrivate(ec,priv,enc){if(priv instanceof KeyPair)
return priv;return new KeyPair(ec,{priv:priv,privEnc:enc})};KeyPair.prototype.validate=function validate(){var pub=this.getPublic();if(pub.isInfinity())
return{result:!1,reason:'Invalid public key'};if(!pub.validate())
return{result:!1,reason:'Public key is not a point'};if(!pub.mul(this.ec.curve.n).isInfinity())
return{result:!1,reason:'Public key * N !=O'};return{result:!0,reason:null}};KeyPair.prototype.getPublic=function getPublic(compact,enc){if(typeof compact==='string'){enc=compact;compact=null}
if(!this.pub)
this.pub=this.ec.g.mul(this.priv);if(!enc)
return this.pub;return this.pub.encode(enc,compact)};KeyPair.prototype.getPrivate=function getPrivate(enc){if(enc==='hex')
return this.priv.toString(16,2);else return this.priv};KeyPair.prototype._importPrivate=function _importPrivate(key,enc){this.priv=new BN(key,enc||16);existing=events[type]=listener;++target._eventsCount}else{if(typeof existing==='function'){existing=events[type]=prepend?[listener,existing]:[existing,listener]}else{module.exports=function(obj){return obj!=null&&(isBuffer(obj)||isSlowBuffer(obj)||!!obj._isBuffer)}
function isBuffer(obj){return!!obj.constructor&&typeof obj.constructor.isBuffer==='function'&&obj.constructor.isBuffer(obj)}
function isSlowBuffer(obj){return typeof obj.readFloatLE==='function'&&typeof obj.slice==='function'&&isBuffer(obj.slice(0,0))}},{}],104:[function(require,module,exports){var toString={}.toString;module.exports=Array.isArray||function(arr){return toString.call(arr)=='[object Array]'}},{}],105:[function(require,module,exports){'use strict'
var inherits=require('inherits')
var HashBase=require('hash-base')
var Buffer=require('safe-buffer').Buffer
var ARRAY16=new Array(16)
function MD5(){HashBase.call(this,64)
this._a=0x67452301
this._b=0xefcdab89
this._c=0x98badcfe
this._d=0x10325476}
inherits(MD5,HashBase)
MD5.prototype._update=function(){var M=ARRAY16
for(var i=0;i<16;++i)M[i]=this._block.readInt32LE(i*4)
var a=this._a
var b=this._b
var c=this._c
var d=this._d
a=fnF(a,b,c,d,M[0],0xd76aa478,7)
d=fnF(d,a,b,c,M[1],0xe8c7b756,12)
c=fnF(c,d,a,b,M[2],0x242070db,17)
b=fnF(b,c,d,a,M[3],0xc1bdceee,22)
a=fnF(a,b,c,d,M[4],0xf57c0faf,7)
d=fnF(d,a,b,c,M[5],0x4787c62a,12)
c=fnF(c,d,a,b,M[6],0xa8304613,17)
b=fnF(b,c,d,a,M[7],0xfd469501,22)
a=fnF(a,b,c,d,M[8],0x698098d8,7)
d=fnF(d,a,b,c,M[9],0x8b44f7af,12)
c=fnF(c,d,a,b,M[10],0xffff5bb1,17)
b=fnF(b,c,d,a,M[11],0x895cd7be,22)
a=fnF(a,b,c,d,M[12],0x6b901122,7)
d=fnF(d,a,b,c,M[13],0xfd987193,12)
c=fnF(c,d,a,b,M[14],0xa679438e,17)
b=fnF(b,c,d,a,M[15],0x49b40821,22)
a=fnG(a,b,c,d,M[1],0xf61e2562,5)
d=fnG(d,a,b,c,M[6],0xc040b340,9)
c=fnG(c,d,a,b,M[11],0x265e5a51,14)
b=fnG(b,c,d,a,M[0],0xe9b6c7aa,20)
a=fnG(a,b,c,d,M[5],0xd62f105d,5)
d=fnG(d,a,b,c,M[10],0x02441453,9)
c=fnG(c,d,a,b,M[15],0xd8a1e681,14)
b=fnG(b,c,d,a,M[4],0xe7d3fbc8,20)
a=fnG(a,b,c,d,M[9],0x21e1cde6,5)
d=fnG(d,a,b,c,M[14],0xc33707d6,9)
c=fnG(c,d,a,b,M[3],0xf4d50d87,14)
b=fnG(b,c,d,a,M[8],0x455a14ed,20)
a=fnG(a,b,c,d,M[13],0xa9e3e905,5)
d=fnG(d,a,b,c,M[2],0xfcefa3f8,9)
c=fnG(c,d,a,b,M[7],0x676f02d9,14)
b=fnG(b,c,d,a,M[12],0x8d2a4c8a,20)
a=fnH(a,b,c,d,M[5],0xfffa3942,4)
d=fnH(d,a,b,c,M[8],0x8771f681,11)
c=fnH(c,d,a,b,M[11],0x6d9d6122,16)
b=fnH(b,c,d,a,M[14],0xfde5380c,23)
a=fnH(a,b,c,d,M[1],0xa4beea44,4)
d=fnH(d,a,b,c,M[4],0x4bdecfa9,11)
c=fnH(c,d,a,b,M[7],0xf6bb4b60,16)
b=fnH(b,c,d,a,M[10],0xbebfbc70,23)
a=fnH(a,b,c,d,M[13],0x289b7ec6,4)
d=fnH(d,a,b,c,M[0],0xeaa127fa,11)
c=fnH(c,d,a,b,M[3],0xd4ef3085,16)
b=fnH(b,c,d,a,M[6],0x04881d05,23)
a=fnH(a,b,c,d,M[9],0xd9d4d039,4)
d=fnH(d,a,b,c,M[12],0xe6db99e5,11)
c=fnH(c,d,a,b,M[15],0x1fa27cf8,16)
b=fnH(b,c,d,a,M[2],0xc4ac5665,23)
a=fnI(a,b,c,d,M[0],0xf4292244,6)
d=fnI(d,a,b,c,M[7],0x432aff97,10)
c=fnI(c,d,a,b,M[14],0xab9423a7,15)
b=fnI(b,c,d,a,M[5],0xfc93a039,21)
a=fnI(a,b,c,d,M[12],0x655b59c3,6)
d=fnI(d,a,b,c,M[3],0x8f0ccc92,10)
c=fnI(c,d,a,b,M[10],0xffeff47d,15)
b=fnI(b,c,d,a,M[1],0x85845dd1,21)
a=fnI(a,b,c,d,M[8],0x6fa87e4f,6)
d=fnI(d,a,b,c,M[15],0xfe2ce6e0,10)
c=fnI(c,d,a,b,M[6],0xa3014314,15)
b=fnI(b,c,d,a,M[13],0x4e0811a1,21)
a=fnI(a,b,c,d,M[4],0xf7537e82,6)
d=fnI(d,a,b,c,M[11],0xbd3af235,10)
c=fnI(c,d,a,b,M[2],0x2ad7d2bb,15)
b=fnI(b,c,d,a,M[9],0xeb86d391,21)
this._a=(this._a+a)|0
this._b=(this._b+b)|0
this._c=(this._c+c)|0
this._d=(this._d+d)|0}
MD5.prototype._digest=function(){this._block[this._blockOffset++]=0x80
if(this._blockOffset>56){this._block.fill(0,this._blockOffset,64)
this._update()
this._blockOffset=0}
this._block.fill(0,this._blockOffset,56)
this._block.writeUInt32LE(this._length[0],56)
this._block.writeUInt32LE(this._length[1],60)
this._update()
var buffer=Buffer.allocUnsafe(16)
buffer.writeInt32LE(this._a,0)
buffer.writeInt32LE(this._b,4)
buffer.writeInt32LE(this._c,8)
buffer.writeInt32LE(this._d,12)
return buffer}
function rotl(x,n){return(x<<n)|(x>>>(32-n))}
function fnF(a,b,c,d,m,k,s){return(rotl((a+((b&c)|((~b)&d))+m+k)|0,s)+b)|0}
function fnG(a,b,c,d,m,k,s){return(rotl((a+((b&d)|(c&(~d)))+m+k)|0,s)+b)|0}
function fnH(a,b,c,d,m,k,s){return(rotl((a+(b^c^d)+m+k)|0,s)+b)|0}
function fnI(a,b,c,d,m,k,s){return(rotl((a+((c^(b|(~d))))+m+k)|0,s)+b)|0}
module.exports=MD5},{"hash-base":86,"inherits":102,"safe-buffer":148}],106:[function(require,module,exports){var bn=require('bn.js');var brorand=require('brorand');function MillerRabin(rand){this.rand=rand||new brorand.Rand()}
module.exports=MillerRabin;MillerRabin.create=function create(rand){return new MillerRabin(rand)};MillerRabin.prototype._randbelow=function _randbelow(n){var len=n.bitLength();var min_bytes=Math.ceil(len/8);do var a=new bn(this.rand.generate(min_bytes));while(a.cmp(n)>=0);return a};MillerRabin.prototype._randrange=function _randrange(start,stop){var size=stop.sub(start);return start.add(this._randbelow(size))};MillerRabin.prototype.test=function test(n,k,cb){var len=n.bitLength();var red=bn.mont(n);var rone=new bn(1).toRed(red);if(!k)
k=Math.max(1,(len/48)|0);var n1=n.subn(1);for(var s=0;!n1.testn(s);s++){}
var d=n.shrn(s);var rn1=n1.toRed(red);var prime=!0;for(;k>0;k--){var a=this._randrange(new bn(2),n1);if(cb)
cb(a);var x=a.toRed(red).redPow(d);if(x.cmp(rone)===0||x.cmp(rn1)===0)
continue;for(var i=1;i<s;i++){x=x.redSqr();if(x.cmp(rone)===0)
return!1;if(x.cmp(rn1)===0)
break}
if(i===s)
return!1}
return prime};MillerRabin.prototype.getDivisor=function getDivisor(n,k){var len=n.bitLength();var red=bn.mont(n);var rone=new bn(1).toRed(red);if(!k)
k=Math.max(1,(len/48)|0);var n1=n.subn(1);for(var s=0;!n1.testn(s);s++){}
var d=n.shrn(s);var rn1=n1.toRed(red);for(;k>0;k--){var a=this._randrange(new bn(2),n1);var g=n.gcd(a);if(g.cmpn(1)!==0)
return g;var x=a.toRed(red).redPow(d);if(x.cmp(rone)===0||x.cmp(rn1)===0)
continue;for(var i=1;i<s;i++){x=x.redSqr();if(x.cmp(rone)===0)
return x.fromRed().subn(1).gcd(n);if(x.cmp(rn1)===0)
break}
if(i===s){x=x.redSqr();return x.fromRed().subn(1).gcd(n)}}
return!1}},{"bn.js":17,"brorand":18}],107:[function(require,module,exports){module.exports=assert;function assert(val,msg){if(!val)
throw new Error(msg||'Assertion failed')}
assert.equal=function assertEqual(l,r,msg){if(l!=r)
throw new Error(msg||('Assertion failed:'+l+' !='+r))}},{}],108:[function(require,module,exports){'use strict';var utils=exports;function toArray(msg,enc){if(Array.isArray(msg))
return msg.slice();if(!msg)
return[];var res=[];if(typeof msg!=='string'){for(var i=0;i<msg.length;i++)
res[i]=msg[i]|0;return res}
if(enc==='hex'){msg=msg.replace(/[^a-z0-9]+/ig,'');if(msg.length%2!==0)
msg='0'+msg;for(var i=0;i<msg.length;i+=2)
res.push(parseInt(msg[i]+msg[i+1],16));}else{for(var i=0;i<msg.length;i++){var c=msg.charCodeAt(i);var hi=c>>8;var lo=c&0xff;if(hi)
res.push(hi,lo);else res.push(lo)}}
return res}
utils.toArray=toArray;function zero2(word){if(word.length===1)
return'0'+word;else return word}
utils.zero2=zero2;function toHex(msg){var res='';for(var i=0;i<msg.length;i++)
res+=zero2(msg[i].toString(16));return res}
utils.toHex=toHex;utils.encode=function encode(arr,enc){if(enc==='hex')
return toHex(arr);else return arr}},{}],109:[function(require,module,exports){exports.endianness=function(){return'LE'};exports.hostname=function(){if(typeof location!=='undefined'){return location.hostname}
else return''};exports.loadavg=function(){return[]};exports.uptime=function(){return 0};exports.freemem=function(){return Number.MAX_VALUE};exports.totalmem=function(){return Number.MAX_VALUE};exports.cpus=function(){return[]};exports.type=function(){return'Browser'};exports.release=function(){if(typeof navigator!=='undefined'){return navigator.appVersion}
return''};exports.networkInterfaces=exports.getNetworkInterfaces=function(){return{}};exports.arch=function(){return'javascript'};exports.platform=function(){return'browser'};exports.tmpdir=exports.tmpDir=function(){return'/tmp'};exports.EOL='\n';exports.homedir=function(){return'/'}},{}],110:[function(require,module,exports){module.exports={"2.16.840.1.101.3.4.1.1":"aes-128-ecb","2.16.840.1.101.3.4.1.2":"aes-128-cbc","2.16.840.1.101.3.4.1.3":"aes-128-ofb","2.16.840.1.101.3.4.1.4":"aes-128-cfb","2.16.840.1.101.3.4.1.21":"aes-192-ecb","2.16.840.1.101.3.4.1.22":"aes-192-cbc","2.16.840.1.101.3.4.1.23":"aes-192-ofb","2.16.840.1.101.3.4.1.24":"aes-192-cfb","2.16.840.1.101.3.4.1.41":"aes-256-ecb","2.16.840.1.101.3.4.1.42":"aes-256-cbc","2.16.840.1.101.3.4.1.43":"aes-256-ofb","2.16.840.1.101.3.4.1.44":"aes-256-cfb"}},{}],111:[function(require,module,exports){'use strict'
var asn1=require('asn1.js')
exports.certificate=require('./certificate')
var RSAPrivateKey=asn1.define('RSAPrivateKey',function(){this.seq().obj(this.key('version').int(),this.key('modulus').int(),this.key('publicExponent').int(),this.key('privateExponent').int(),this.key('prime1').int(),this.key('prime2').int(),this.key('exponent1').int(),this.key('exponent2').int(),this.key('coefficient').int())})
exports.RSAPrivateKey=RSAPrivateKey
var RSAPublicKey=asn1.define('RSAPublicKey',function(){this.seq().obj(this.key('modulus').int(),this.key('publicExponent').int())})
exports.RSAPublicKey=RSAPublicKey
var PublicKey=asn1.define('SubjectPublicKeyInfo',function(){this.seq().obj(this.key('algorithm').use(AlgorithmIdentifier),this.key('subjectPublicKey').bitstr())})
exports.PublicKey=PublicKey
var AlgorithmIdentifier=asn1.define('AlgorithmIdentifier',function(){this.seq().obj(this.key('algorithm').objid(),this.key('none').null_().optional(),this.key('curve').objid().optional(),this.key('params').seq().obj(this.key('p').int(),this.key('q').int(),this.key('g').int()).optional())})
var PrivateKeyInfo=asn1.define('PrivateKeyInfo',function(){this.seq().obj(this.key('version').int(),this.key('algorithm').use(AlgorithmIdentifier),this.key('subjectPrivateKey').octstr())})
exports.PrivateKey=PrivateKeyInfo
var EncryptedPrivateKeyInfo=asn1.define('EncryptedPrivateKeyInfo',function(){this.seq().obj(this.key('algorithm').seq().obj(this.key('id').objid(),this.key('decrypt').seq().obj(this.key('kde').seq().obj(this.key('id').objid(),this.key('kdeparams').seq().obj(this.key('salt').octstr(),this.key('iters').int())),this.key('cipher').seq().obj(this.key('algo').objid(),this.key('iv').octstr()))),this.key('subjectPrivateKey').octstr())})
exports.EncryptedPrivateKey=EncryptedPrivateKeyInfo
var DSAPrivateKey=asn1.define('DSAPrivateKey',function(){this.seq().obj(this.key('version').int(),this.key('p').int(),this.key('q').int(),this.key('g').int(),this.key('pub_key').int(),this.key('priv_key').int())})
exports.DSAPrivateKey=DSAPrivateKey
exports.DSAparam=asn1.define('DSAparam',function(){this.int()})
var ECPrivateKey=asn1.define('ECPrivateKey',function(){this.seq().obj(this.key('version').int(),this.key('privateKey').octstr(),this.key('parameters').optional().explicit(0).use(ECParameters),this.key('publicKey').optional().explicit(1).bitstr())})
exports.ECPrivateKey=ECPrivateKey
var ECParameters=asn1.define('ECParameters',function(){this.choice({namedCurve:this.objid()})})
exports.signature=asn1.define('signature',function(){this.seq().obj(this.key('r').int(),this.key('s').int())})},{"./certificate":112,"asn1.js":2}],112:[function(require,module,exports){'use strict'
var asn=require('asn1.js')
var Time=asn.define('Time',function(){this.choice({utcTime:this.utctime(),generalTime:this.gentime()})})
var AttributeTypeValue=asn.define('AttributeTypeValue',function(){this.seq().obj(this.key('type').objid(),this.key('value').any())})
var AlgorithmIdentifier=asn.define('AlgorithmIdentifier',function(){this.seq().obj(this.key('algorithm').objid(),this.key('parameters').optional())})
var SubjectPublicKeyInfo=asn.define('SubjectPublicKeyInfo',function(){this.seq().obj(this.key('algorithm').use(AlgorithmIdentifier),this.key('subjectPublicKey').bitstr())})
var RelativeDistinguishedName=asn.define('RelativeDistinguishedName',function(){this.setof(AttributeTypeValue)})
var RDNSequence=asn.define('RDNSequence',function(){this.seqof(RelativeDistinguishedName)})
var Name=asn.define('Name',function(){this.choice({rdnSequence:this.use(RDNSequence)})})
var Validity=asn.define('Validity',function(){this.seq().obj(this.key('notBefore').use(Time),this.key('notAfter').use(Time))})
var Extension=asn.define('Extension',function(){this.seq().obj(this.key('extnID').objid(),this.key('critical').bool().def(!1),this.key('extnValue').octstr())})
var TBSCertificate=asn.define('TBSCertificate',function(){this.seq().obj(this.key('version').explicit(0).int(),this.key('serialNumber').int(),this.key('signature').use(AlgorithmIdentifier),this.key('issuer').use(Name),this.key('validity').use(Validity),this.key('subject').use(Name),this.key('subjectPublicKeyInfo').use(SubjectPublicKeyInfo),this.key('issuerUniqueID').implicit(1).bitstr().optional(),this.key('subjectUniqueID').implicit(2).bitstr().optional(),this.key('extensions').explicit(3).seqof(Extension).optional())})
var X509Certificate=asn.define('X509Certificate',function(){this.seq().obj(this.key('tbsCertificate').use(TBSCertificate),this.key('signatureAlgorithm').use(AlgorithmIdentifier),this.key('signatureValue').bitstr())})
module.exports=X509Certificate},{"asn1.js":2}],113:[function(require,module,exports){(function(Buffer){var findProc=/Proc-Type: 4,ENCRYPTED[\n\r]+DEK-Info: AES-((?:128)|(?:192)|(?:256))-CBC,([0-9A-H]+)[\n\r]+([0-9A-z\n\r\+\/\=]+)[\n\r]+/m
var startRegex=/^-----BEGIN ((?:.* KEY)|CERTIFICATE)-----/m
var fullRegex=/^-----BEGIN ((?:.* KEY)|CERTIFICATE)-----([0-9A-z\n\r\+\/\=]+)-----END \1-----$/m
var evp=require('evp_bytestokey')
var ciphers=require('browserify-aes')
module.exports=function(okey,password){var key=okey.toString()
var match=key.match(findProc)
var decrypted
if(!match){var match2=key.match(fullRegex)
decrypted=new Buffer(match2[2].replace(/[\r\n]/g,''),'base64')}else{var suite='aes'+match[1]
var iv=new Buffer(match[2],'hex')
var cipherText=new Buffer(match[3].replace(/[\r\n]/g,''),'base64')
var cipherKey=evp(password,iv.slice(0,8),parseInt(match[1],10)).key
var out=[]
var cipher=ciphers.createDecipheriv(suite,cipherKey,iv)
out.push(cipher.update(cipherText))
out.push(cipher.final())
decrypted=Buffer.concat(out)}
var tag=key.match(startRegex)[1]
return{tag:tag,data:decrypted}}}).call(this,require("buffer").Buffer)},{"browserify-aes":22,"buffer":48,"evp_bytestokey":85}],114:[function(require,module,exports){(function(Buffer){var asn1=require('./asn1')
var aesid=require('./aesid.json')
var fixProc=require('./fixProc')
var ciphers=require('browserify-aes')
var compat=require('pbkdf2')
module.exports=parseKeys
function parseKeys(buffer){var password
if(typeof buffer==='object'&&!Buffer.isBuffer(buffer)){password=buffer.passphrase
buffer=buffer.key}
if(typeof buffer==='string'){buffer=new Buffer(buffer)}
var stripped=fixProc(buffer,password)
var type=stripped.tag
var data=stripped.data
var subtype,ndata
switch(type){case 'CERTIFICATE':ndata=asn1.certificate.decode(data,'der').tbsCertificate.subjectPublicKeyInfo
case 'PUBLIC KEY':if(!ndata){ndata=asn1.PublicKey.decode(data,'der')}
subtype=ndata.algorithm.algorithm.join('.')
switch(subtype){case '1.2.840.113549.1.1.1':return asn1.RSAPublicKey.decode(ndata.subjectPublicKey.data,'der')
case '1.2.840.10045.2.1':ndata.subjectPrivateKey=ndata.subjectPublicKey
return{type:'ec',data:ndata}
case '1.2.840.10040.4.1':ndata.algorithm.params.pub_key=asn1.DSAparam.decode(ndata.subjectPublicKey.data,'der')
return{type:'dsa',data:ndata.algorithm.params}
default:throw new Error('unknown key id '+subtype)}
throw new Error('unknown key type '+type)
case 'ENCRYPTED PRIVATE KEY':data=asn1.EncryptedPrivateKey.decode(data,'der')
data=decrypt(data,password)
case 'PRIVATE KEY':ndata=asn1.PrivateKey.decode(data,'der')
subtype=ndata.algorithm.algorithm.join('.')
switch(subtype){case '1.2.840.113549.1.1.1':return asn1.RSAPrivateKey.decode(ndata.subjectPrivateKey,'der')
case '1.2.840.10045.2.1':return{curve:ndata.algorithm.curve,privateKey:asn1.ECPrivateKey.decode(ndata.subjectPrivateKey,'der').privateKey}
case '1.2.840.10040.4.1':ndata.algorithm.params.priv_key=asn1.DSAparam.decode(ndata.subjectPrivateKey,'der')
return{type:'dsa',params:ndata.algorithm.params}
default:throw new Error('unknown key id '+subtype)}
throw new Error('unknown key type '+type)
case 'RSA PUBLIC KEY':return asn1.RSAPublicKey.decode(data,'der')
case 'RSA PRIVATE KEY':return asn1.RSAPrivateKey.decode(data,'der')
case 'DSA PRIVATE KEY':return{type:'dsa',params:asn1.DSAPrivateKey.decode(data,'der')}
case 'EC PRIVATE KEY':data=asn1.ECPrivateKey.decode(data,'der')
return{curve:data.parameters.value,privateKey:data.privateKey}
default:throw new Error('unknown key type '+type)}}
parseKeys.signature=asn1.signature
function decrypt(data,password){var salt=data.algorithm.decrypt.kde.kdeparams.salt
var iters=parseInt(data.algorithm.decrypt.kde.kdeparams.iters.toString(),10)
var algo=aesid[data.algorithm.decrypt.cipher.algo.join('.')]
var iv=data.algorithm.decrypt.cipher.iv
var cipherText=data.subjectPrivateKey
var keylen=parseInt(algo.split('-')[1],10)/8
var key=compat.pbkdf2Sync(password,salt,iters,keylen)
var cipher=ciphers.createDecipheriv(algo,key,iv)
var out=[]
out.push(cipher.update(cipherText))
out.push(cipher.final())
return Buffer.concat(out)}}).call(this,require("buffer").Buffer)},{"./aesid.json":110,"./asn1":111,"./fixProc":113,"browserify-aes":22,"buffer":48,"pbkdf2":115}],115:[function(require,module,exports){exports.pbkdf2=require('./lib/async')
exports.pbkdf2Sync=require('./lib/sync')},{"./lib/async":116,"./lib/sync":119}],116:[function(require,module,exports){(function(process,global){var checkParameters=require('./precondition')
var defaultEncoding=require('./default-encoding')
var sync=require('./sync')
var Buffer=require('safe-buffer').Buffer
var ZERO_BUF
var subtle=global.crypto&&global.crypto.subtle
var toBrowser={'sha':'SHA-1','sha-1':'SHA-1','sha1':'SHA-1','sha256':'SHA-256','sha-256':'SHA-256','sha384':'SHA-384','sha-384':'SHA-384','sha-512':'SHA-512','sha512':'SHA-512'}
var checks=[]
function checkNative(algo){if(global.process&&!global.process.browser){return Promise.resolve(!1)}
if(!subtle||!subtle.importKey||!subtle.deriveBits){return Promise.resolve(!1)}
if(checks[algo]!==undefined){return checks[algo]}
ZERO_BUF=ZERO_BUF||Buffer.alloc(8)
var prom=browserPbkdf2(ZERO_BUF,ZERO_BUF,10,128,algo).then(function(){return!0}).catch(function(){return!1})
checks[algo]=prom
return prom}
function browserPbkdf2(password,salt,iterations,length,algo){return subtle.importKey('raw',password,{name:'PBKDF2'},!1,['deriveBits']).then(function(key){return subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:iterations,hash:{name:algo}},key,length<<3)}).then(function(res){return Buffer.from(res)})}
function resolvePromise(promise,callback){promise.then(function(out){process.nextTick(function(){callback(null,out)})},function(e){process.nextTick(function(){callback(e)})})}
module.exports=function(password,salt,iterations,keylen,digest,callback){if(typeof digest==='function'){callback=digest
digest=undefined}
digest=digest||'sha1'
var algo=toBrowser[digest.toLowerCase()]
if(!algo||typeof global.Promise!=='function'){return process.nextTick(function(){var out
try{out=sync(password,salt,iterations,keylen,digest)}catch(e){return callback(e)}
callback(null,out)})}
checkParameters(password,salt,iterations,keylen)
if(typeof callback!=='function')throw new Error('No callback provided to pbkdf2')
if(!Buffer.isBuffer(password))password=Buffer.from(password,defaultEncoding)
if(!Buffer.isBuffer(salt))salt=Buffer.from(salt,defaultEncoding)
resolvePromise(checkNative(algo).then(function(resp){if(resp)return browserPbkdf2(password,salt,iterations,keylen,algo)
return sync(password,salt,iterations,keylen,digest)}),callback)}}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./default-encoding":117,"./precondition":118,"./sync":119,"_process":121,"safe-buffer":148}],117:[function(require,module,exports){(function(process){var defaultEncoding
if(process.browser){defaultEncoding='utf-8'}else{var pVersionMajor=parseInt(process.version.split('.')[0].slice(1),10)
defaultEncoding=pVersionMajor>=6?'utf-8':'binary'}
module.exports=defaultEncoding}).call(this,require('_process'))},{"_process":121}],118:[function(require,module,exports){(function(Buffer){var MAX_ALLOC=Math.pow(2,30)-1
function checkBuffer(buf,name){if(typeof buf!=='string'&&!Buffer.isBuffer(buf)){throw new TypeError(name+' must be a buffer or string')}}
module.exports=function(password,salt,iterations,keylen){checkBuffer(password,'Password')
checkBuffer(salt,'Salt')
if(typeof iterations!=='number'){throw new TypeError('Iterations not a number')}
if(iterations<0){throw new TypeError('Bad iterations')}
if(typeof keylen!=='number'){throw new TypeError('Key length not a number')}
if(keylen<0||keylen>MAX_ALLOC||keylen!==keylen){throw new TypeError('Bad key length')}}}).call(this,{"isBuffer":require("../../is-buffer/index.js")})},{"../../is-buffer/index.js":103}],119:[function(require,module,exports){var md5=require('create-hash/md5')
var RIPEMD160=require('ripemd160')
var sha=require('sha.js')
var checkParameters=require('./precondition')
var defaultEncoding=require('./default-encoding')
var Buffer=require('safe-buffer').Buffer
var ZEROS=Buffer.alloc(128)
var sizes={md5:16,sha1:20,sha224:28,sha256:32,sha384:48,sha512:64,rmd160:20,ripemd160:20}
function Hmac(alg,key,saltLen){var hash=getDigest(alg)
var blocksize=(alg==='sha512'||alg==='sha384')?128:64
if(key.length>blocksize){key=hash(key)}else if(key.length<blocksize){key=Buffer.concat([key,ZEROS],blocksize)}
var ipad=Buffer.allocUnsafe(blocksize+sizes[alg])
var opad=Buffer.allocUnsafe(blocksize+sizes[alg])
for(var i=0;i<blocksize;i++){ipad[i]=key[i]^0x36
opad[i]=key[i]^0x5C}
var ipad1=Buffer.allocUnsafe(blocksize+saltLen+4)
ipad.copy(ipad1,0,0,blocksize)
this.ipad1=ipad1
this.ipad2=ipad
this.opad=opad
this.alg=alg
this.blocksize=blocksize
this.hash=hash
this.size=sizes[alg]}
Hmac.prototype.run=function(data,ipad){data.copy(ipad,this.blocksize)
var h=this.hash(ipad)
h.copy(this.opad,this.blocksize)
return this.hash(this.opad)}
function getDigest(alg){function shaFunc(data){return sha(alg).update(data).digest()}
function rmd160Func(data){return new RIPEMD160().update(data).digest()}
if(alg==='rmd160'||alg==='ripemd160')return rmd160Func
if(alg==='md5')return md5
return shaFunc}
function pbkdf2(password,salt,iterations,keylen,digest){checkParameters(password,salt,iterations,keylen)
if(!Buffer.isBuffer(password))password=Buffer.from(password,defaultEncoding)
if(!Buffer.isBuffer(salt))salt=Buffer.from(salt,defaultEncoding)
digest=digest||'sha1'
var hmac=new Hmac(digest,password,salt.length)
var DK=Buffer.allocUnsafe(keylen)
var block1=Buffer.allocUnsafe(salt.length+4)
salt.copy(block1,0,0,salt.length)
var destPos=0
var hLen=sizes[digest]
var l=Math.ceil(keylen/hLen)
for(var i=1;i<=l;i++){block1.writeUInt32BE(i,salt.length)
var T=hmac.run(block1,hmac.ipad1)
var U=T
for(var j=1;j<iterations;j++){U=hmac.run(U,hmac.ipad2)
for(var k=0;k<hLen;k++)T[k]^=U[k]}
T.copy(DK,destPos)
destPos+=hLen}
return DK}
module.exports=pbkdf2},{"./default-encoding":117,"./precondition":118,"create-hash/md5":54,"ripemd160":147,"safe-buffer":148,"sha.js":150}],120:[function(require,module,exports){(function(process){'use strict';if(!process.version||process.version.indexOf('v0.')===0||process.version.indexOf('v1.')===0&&process.version.indexOf('v1.8.')!==0){module.exports={nextTick:nextTick}}else{module.exports=process}
function nextTick(fn,arg1,arg2,arg3){if(typeof fn!=='function'){throw new TypeError('"callback" argument must be a function')}
var len=arguments.length;var args,i;switch(len){case 0:case 1:return process.nextTick(fn);case 2:return process.nextTick(function afterTickOne(){fn.call(null,arg1)});case 3:return process.nextTick(function afterTickTwo(){fn.call(null,arg1,arg2)});case 4:return process.nextTick(function afterTickThree(){fn.call(null,arg1,arg2,arg3)});default:args=new Array(len-1);i=0;while(i<args.length){args[i++]=arguments[i]}
return process.nextTick(function afterTick(){fn.apply(null,args)})}}}).call(this,require('_process'))},{"_process":121}],121:[function(require,module,exports){var process=module.exports={};if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout){cachedSetTimeout=setTimeout;return setTimeout(fun,0)}
try{return cachedSetTimeout(fun,0)}catch(e){try{return cachedSetTimeout.call(this,fun,0)}}}
function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout){return clearTimeout(marker)}
return cachedClearTimeout.call(null,marker)}catch(e){var output=[],inputLength=input.length,out,i=0,n=initialN,bias=initialBias,basic,j,index,oldi,w,k,digit,t,baseMinusT;basic=input.lastIndexOf(delimiter);if(basic<0){basic=0}
for(j=0;j<basic;++j){if(floor(i/out)>maxInt-n){error('overflow')}
n+=floor(i/out);i%=out;output.splice(i++,0,n)}
return ucs2encode(output)}
function encode(input){var n,delta,handledCPCount,basicLength,bias,j,m,q,k,t,currentValue,output=[],inputLength,handledCPCountPlusOne,baseMinusT,qMinusT;input=ucs2decode(input);inputLength=input.length;n=initialN;delta=0;bias=initialBias;for(j=0;j<inputLength;++j){currentValue=input[j];if(currentValue<0x80){output.push(stringFromCharCode(currentValue))}}
handledCPCount=basicLength=output.length;if(basicLength){output.push(delimiter)}
while(handledCPCount<inputLength){for(m=maxInt,j=0;j<inputLength;++j){currentValue=input[j];if(currentValue>=n&&currentValue<m){m=currentValue}}
var rawBytes=new global.Uint8Array(size)
if(size>0){crypto.getRandomValues(rawBytes)}
'use strict';var pna=require('process-nextick-args');var objectKeys=Object.keys||function(obj){var keys=[];for(var key in obj){keys.push(key)}return keys};module.exports=Duplex;var util=require('core-util-is');util.inherits=require('inherits');var Readable=require('./_stream_readable');var Writable=require('./_stream_writable');util.inherits(Duplex,Readable);{var keys=objectKeys(Writable.prototype);for(var v=0;v<keys.length;v++){var method=keys[v];if(!Duplex.prototype[method])Duplex.prototype[method]=Writable.prototype[method]}}
function Duplex(options){if(!(this instanceof Duplex))return new Duplex(options);Readable.call(this,options);Writable.call(this,options);if(options&&options.readable===!1)this.readable=!1;if(options&&options.writable===!1)this.writable=!1;this.allowHalfOpen=!0;if(options&&options.allowHalfOpen===!1)this.allowHalfOpen=!1;this.once('end',onend)}
Object.defineProperty(Duplex.prototype,'writableHighWaterMark',{enumerable:!1,get:function(){return this._writableState.highWaterMark}});function onend(){this.sync=!0;function needMoreData(state){return!state.ended&&(state.needReadable||state.length<state.highWaterMark||state.length===0)}
Readable.prototype.isPaused=function(){return this._readableState.flowing===!1};Readable.prototype.setEncoding=function(enc){if(!StringDecoder)StringDecoder=require('string_decoder/').StringDecoder;this._readableState.decoder=new StringDecoder(enc);this._readableState.encoding=enc;return this};if(n>state.highWaterMark)state.highWaterMark=computeNewHighWaterMark(n);if(n<=state.length)return n;if(n===0&&state.needReadable&&(state.length>=state.highWaterMark||state.ended)){debug('read:emitReadable',state.length,state.ended);if(state.length===0&&state.ended)endReadable(this);else emitReadable(this);return null}
n=howMuchToRead(n,state);if(n===0&&state.ended){if(state.length===0)endReadable(this);return null}
var doRead=state.needReadable;debug('need readable',doRead);if(state.length===0||state.length-n<state.highWaterMark){doRead=!0;debug('length less than watermark',doRead)}
if(state.ended||state.reading){doRead=!1;debug('reading or ended',doRead)}else if(doRead){debug('do read');state.reading=!0;state.sync=!0;if(state.length===0)state.needReadable=!0;this._read(state.highWaterMark);state.sync=!1;if(!state.reading)n=howMuchToRead(nOrig,state)}
var ret;if(n>0)ret=fromList(n,state);else ret=null;if(ret===null){state.needReadable=!0;n=0}else{state.length-=n}
if(state.length===0){if(!state.ended)state.needReadable=!0;if(nOrig!==n&&state.ended)endReadable(this)}
if(ret!==null)this.emit('data',ret);return ret};function onEofChunk(stream,state){if(state.ended)return;if(state.decoder){var chunk=state.decoder.end();if(chunk&&chunk.length){state.buffer.push(chunk);state.length+=state.objectMode?1:chunk.length}}
state.ended=!0;emitReadable(stream)}
function emitReadable(stream){var state=stream._readableState;state.needReadable=!1;if(!state.emittedReadable){debug('emitReadable',state.flowing);state.emittedReadable=!0;if(state.sync)pna.nextTick(emitReadable_,stream);else emitReadable_(stream)}}
function emitReadable_(stream){debug('emit readable');stream.emit('readable');flow(stream)}
function maybeReadMore(stream,state){if(!state.readingMore){state.readingMore=!0;pna.nextTick(maybeReadMore_,stream,state)}}
function maybeReadMore_(stream,state){var len=state.length;while(!state.reading&&!state.flowing&&!state.ended&&state.length<state.highWaterMark){debug('maybeReadMore read 0');stream.read(0);if(len===state.length)
if(state.awaitDrain&&(!dest._writableState||dest._writableState.needDrain))ondrain()}
var increasedAwaitDrain=!1;src.on('data',ondata);function ondata(chunk){debug('ondata');increasedAwaitDrain=!1;var ret=dest.write(chunk);if(!1===ret&&!increasedAwaitDrain){if((state.pipesCount===1&&state.pipes===dest||state.pipesCount>1&&indexOf(state.pipes,dest)!==-1)&&!cleanedUp){debug('false write response,pause',src._readableState.awaitDrain);src._readableState.awaitDrain++;increasedAwaitDrain=!0}
src.pause()}}
dest.emit('pipe',src);if(state.pipesCount===0)return this;if(state.pipesCount===1){if(this._readableState.flowing!==!1)this.resume()}else if(ev==='readable'){var state=this._readableState;if(!state.endEmitted&&!state.readableListening){state.readableListening=state.needReadable=!0;state.emittedReadable=!1;if(!state.reading){pna.nextTick(nReadingNextTick,this)}else if(state.length){emitReadable(this)}}}
return res};Readable.prototype.addListener=Readable.prototype.on;function nReadingNextTick(self){debug('readable nexttick read 0');self.read(0)}
Readable.prototype.resume=function(){var state=this._readableState;if(!state.flowing){debug('resume');state.flowing=!0;resume(this,state)}
return this};function resume(stream,state){if(!state.resumeScheduled){state.resumeScheduled=!0;pna.nextTick(resume_,stream,state)}}
function resume_(stream,state){if(!state.reading){debug('resume read 0');stream.read(0)}
state.resumeScheduled=!1;state.awaitDrain=0;stream.emit('resume');flow(stream);if(state.flowing&&!state.reading)stream.read(0)}
Readable.prototype.pause=function(){debug('call pause flowing=%j',this._readableState.flowing);if(!1!==this._readableState.flowing){debug('pause');this._readableState.flowing=!1;this.emit('pause')}
return this};function flow(stream){var state=stream._readableState;debug('flow',state.flowing);while(state.flowing&&stream.read()!==null){}}
Readable.prototype.wrap=function(stream){var _this=this;var state=this._readableState;var paused=!1;stream.on('end',function(){debug('wrapped end');if(state.decoder&&!state.ended){var chunk=state.decoder.end();if(chunk&&chunk.length)_this.push(chunk)}
_this.push(null)});stream.on('data',function(chunk){debug('wrapped data');if(state.decoder)chunk=state.decoder.write(chunk);if(!state.endEmitted&&state.length===0){state.endEmitted=!0;stream.readable=!1;stream.emit('end')}}
function indexOf(xs,x){for(var i=0,l=xs.length;i<l;i++){if(xs[i]===x)return i}
return-1}}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./_stream_duplex":135,"./internal/streams/BufferList":140,"./internal/streams/destroy":141,"./internal/streams/stream":142,"_process":121,"core-util-is":51,"events":84,"inherits":102,"isarray":104,"process-nextick-args":120,"safe-buffer":148,"string_decoder/":162,"util":19}],138:[function(require,module,exports){'use strict';module.exports=Transform;var Duplex=require('./_stream_duplex');var util=require('core-util-is');util.inherits=require('inherits');util.inherits(Transform,Duplex);function afterTransform(er,data){var ts=this._transformState;ts.transforming=!1;var cb=ts.writecb;if(!cb){return this.emit('error',new Error('write callback called multiple times'))}
ts.writechunk=null;ts.writecb=null;if(data!=null)
this.push(data);cb(er);var rs=this._readableState;rs.reading=!1;if(rs.needReadable||rs.length<rs.highWaterMark){this._read(rs.highWaterMark)}}
function Transform(options){if(!(this instanceof Transform))return new Transform(options);Duplex.call(this,options);this._transformState={afterTransform:afterTransform.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null};this._readableState.needReadable=!0;this._readableState.sync=!1;if(options){if(typeof options.transform==='function')this._transform=options.transform;if(typeof options.flush==='function')this._flush=options.flush}
this.on('prefinish',prefinish)}
function prefinish(){var _this=this;if(typeof this._flush==='function'){this._flush(function(er,data){done(_this,er,data)})}else{done(this,null,null)}}
Transform.prototype.push=function(chunk,encoding){this._transformState.needTransform=!1;return Duplex.prototype.push.call(this,chunk,encoding)};Transform.prototype._transform=function(chunk,encoding,cb){throw new Error('_transform() is not implemented')};Transform.prototype._write=function(chunk,encoding,cb){var ts=this._transformState;ts.writecb=cb;ts.writechunk=chunk;ts.writeencoding=encoding;if(!ts.transforming){var rs=this._readableState;if(ts.needTransform||rs.needReadable||rs.length<rs.highWaterMark)this._read(rs.highWaterMark)}};ts.needTransform=!0}};Transform.prototype._destroy=function(err,cb){var _this2=this;Duplex.prototype._destroy.call(this,err,function(err2){cb(err2);_this2.emit('close')})};function done(stream,er,data){if(er)return stream.emit('error',er);if(data!=null)
stream.push(data);'use strict';var pna=require('process-nextick-args');module.exports=Writable;function WriteReq(chunk,encoding,cb){this.chunk=chunk;this.encoding=encoding;this.callback=cb;this.next=null}
function CorkedRequest(state){var _this=this;this.next=null;this.entry=null;this.finish=function(){onCorkedFinish(_this,state)}}
var asyncWrite=!process.browser&&['v0.10','v0.9.'].indexOf(process.version.slice(0,5))>-1?setImmediate:pna.nextTick;var Duplex;Writable.WritableState=WritableState;var util=require('core-util-is');util.inherits=require('inherits');var internalUtil={deprecate:require('util-deprecate')};var Stream=require('./internal/streams/stream');var Buffer=require('safe-buffer').Buffer;var OurUint8Array=global.Uint8Array||function(){};function _uint8ArrayToBuffer(chunk){return Buffer.from(chunk)}
function _isUint8Array(obj){return Buffer.isBuffer(obj)||obj instanceof OurUint8Array}
var destroyImpl=require('./internal/streams/destroy');util.inherits(Writable,Stream);function nop(){}
function WritableState(options,stream){Duplex=Duplex||require('./_stream_duplex');options=options||{};var isDuplex=stream instanceof Duplex;this.objectMode=!!options.objectMode;if(isDuplex)this.objectMode=this.objectMode||!!options.writableObjectMode;var hwm=options.highWaterMark;var writableHwm=options.writableHighWaterMark;var defaultHwm=this.objectMode?16:16*1024;if(hwm||hwm===0)this.highWaterMark=hwm;else if(isDuplex&&(writableHwm||writableHwm===0))this.highWaterMark=writableHwm;else this.highWaterMark=defaultHwm;this.highWaterMark=Math.floor(this.highWaterMark);this.finalCalled=!1;this.needDrain=!1;this.ending=!1;this.ended=!1;this.finished=!1;this.destroyed=!1;var noDecode=options.decodeStrings===!1;this.decodeStrings=!noDecode;this.defaultEncoding=options.defaultEncoding||'utf8';this.writing=!1;this.corked=0;this.onwrite=function(er){onwrite(stream,er)};this.writecb=null;this.writelen=0;this.bufferedRequest=null;this.lastBufferedRequest=null;this.pendingcb=0;function writeOrBuffer(stream,state,isBuf,chunk,encoding,cb){if(!isBuf){var newChunk=decodeChunk(state,chunk,encoding);if(chunk!==newChunk){isBuf=!0;encoding='buffer';chunk=newChunk}}
var len=state.objectMode?1:chunk.length;state.length+=len;var ret=state.length<state.highWaterMark;if(!ret)state.needDrain=!0;if(state.writing||state.corked){var last=state.lastBufferedRequest;state.lastBufferedRequest={chunk:chunk,encoding:encoding,isBuf:isBuf,callback:cb,next:null};if(last){last.next=state.lastBufferedRequest}else{state.bufferedRequest=state.lastBufferedRequest}
state.bufferedRequestCount+=1}else{doWrite(stream,state,!1,len,chunk,encoding,cb)}
return ret}
function doWrite(stream,state,writev,len,chunk,encoding,cb){state.writelen=len;state.writecb=cb;state.writing=!0;state.sync=!0;if(writev)stream._writev(chunk,state.onwrite);else stream._write(chunk,encoding,state.onwrite);state.sync=!1}
function onwriteError(stream,state,sync,er,cb){--state.pendingcb;if(sync){pna.nextTick(cb,er);pna.nextTick(finishMaybe,stream,state);stream._writableState.errorEmitted=!0;stream.emit('error',er)}else{cb(er);stream._writableState.errorEmitted=!0;stream.emit('error',er);finishMaybe(stream,state)}}
function onwriteStateUpdate(state){state.writing=!1;state.writecb=null;state.length-=state.writelen;state.writelen=0}
function onwrite(stream,er){var state=stream._writableState;var sync=state.sync;var cb=state.writecb;onwriteStateUpdate(state);if(er)onwriteError(stream,state,sync,er,cb);else{var finished=needFinish(state);if(!finished&&!state.corked&&!state.bufferProcessing&&state.bufferedRequest){clearBuffer(stream,state)}
if(sync){asyncWrite(afterWrite,stream,state,finished,cb)}else{afterWrite(stream,state,finished,cb)}}}
function afterWrite(stream,state,finished,cb){if(!finished)onwriteDrain(stream,state);state.pendingcb--;cb();finishMaybe(stream,state)}
function clearBuffer(stream,state){state.bufferProcessing=!0;var entry=state.bufferedRequest;if(stream._writev&&entry&&entry.next){var l=state.bufferedRequestCount;var buffer=new Array(l);var holder=state.corkedRequestsFree;holder.entry=entry;var count=0;var allBuffers=!0;while(entry){buffer[count]=entry;if(!entry.isBuf)allBuffers=!1;entry=entry.next;count+=1}
buffer.allBuffers=allBuffers;doWrite(stream,state,!0,state.length,buffer,'',holder.finish);state.pendingcb++;state.lastBufferedRequest=null;if(holder.next){state.corkedRequestsFree=holder.next;holder.next=null}else{state.corkedRequestsFree=new CorkedRequest(state)}
state.bufferedRequestCount=0}else{while(entry){var chunk=entry.chunk;var encoding=entry.encoding;var cb=entry.callback;var len=state.objectMode?1:chunk.length;doWrite(stream,state,!1,len,chunk,encoding,cb);entry=entry.next;state.bufferedRequestCount--;var xhr
function getXHR(){if(xhr!==undefined)return xhr
if(global.XMLHttpRequest){xhr=new global.XMLHttpRequest()
xhr=null}
return xhr}
function checkTypeSupport(type){var xhr=getXHR()
if(!xhr)return!1
try{xhr.responseType=type
return xhr.responseType===type}catch(e){}
return!1}
var haveArrayBuffer=typeof global.ArrayBuffer!=='undefined'
var haveSlice=haveArrayBuffer&&isFunction(global.ArrayBuffer.prototype.slice)
exports.arraybuffer=exports.fetch||(haveArrayBuffer&&checkTypeSupport('arraybuffer'))
preferBinary=!1}else if(opts.mode==='allow-wrong-content-type'){preferBinary=!capability.overrideMimeType}else if(!opts.mode||opts.mode==='default'||opts.mode==='prefer-fast'){preferBinary=!0}else{throw new Error('Invalid value for opts.mode')}
self._mode=decideMode(preferBinary,useFetch)
self._fetchTimer=null
self.on('finish',function(){self._onFinish()})}
inherits(ClientRequest,stream.Writable)
ClientRequest.prototype.setHeader=function(name,value){var self=this
var lowerName=name.toLowerCase()
if('responseType' in xhr)
xhr.responseType=self._mode.split(':')[0]
if('withCredentials' in xhr)
xhr.withCredentials=!!opts.withCredentials
if(self._mode==='text'&&'overrideMimeType' in xhr)
xhr.overrideMimeType('text/plain;charset=x-user-defined')
if('requestTimeout' in opts){xhr.timeout=opts.requestTimeout
xhr.ontimeout=function(){self.emit('requestTimeout')}}
headersList.forEach(function(header){xhr.setRequestHeader(header[0],header[1])})
self._response=null
xhr.onreadystatechange=function(){switch(xhr.readyState){case rStates.LOADING:case rStates.DONE:self._onXHRProgress()
break}}
if(self._mode==='moz-chunked-arraybuffer'){xhr.onprogress=function(){self._onXHRProgress()}}
xhr.onerror=function(){if(self._destroyed)
return
self.emit('error',new Error('XHR error'))}
try{xhr.send(body)}catch(err){process.nextTick(function(){self.emit('error',err)})
return}}}
function statusValid(xhr){try{var status=xhr.status
return(status!==null&&status!==0)}catch(e){return!1}}
ClientRequest.prototype._onXHRProgress=function(){var self=this
if(!statusValid(self._xhr)||self._destroyed)
return
if(!self._response)
self._connect()
self._response._onXHRProgress()}
ClientRequest.prototype._connect=function(){var self=this
if(self._destroyed)
return
self._response=new IncomingMessage(self._xhr,self._fetchResponse,self._mode,self._fetchTimer)
self._response.on('error',function(err){self.emit('error',err)})
self.emit('response',self._response)}
ClientRequest.prototype._write=function(chunk,encoding,cb){var self=this
self._body.push(chunk)
cb()}
ClientRequest.prototype.abort=ClientRequest.prototype.destroy=function(){var self=this
self._destroyed=!0
global.clearTimeout(self._fetchTimer)
if(self._response)
self._response._destroyed=!0
if(self._xhr)
self._xhr.abort()
else if(self._fetchAbortController)
self._fetchAbortController.abort()}
ClientRequest.prototype.end=function(data,encoding,cb){var self=this
if(typeof data==='function'){cb=data
data=undefined}
stream.Writable.prototype.end.call(self,data,encoding,cb)}
ClientRequest.prototype.flushHeaders=function(){}
ClientRequest.prototype.setTimeout=function(){}
ClientRequest.prototype.setNoDelay=function(){}
ClientRequest.prototype.setSocketKeepAlive=function(){}
var unsafeHeaders=['accept-charset','accept-encoding','access-control-request-headers','access-control-request-method','connection','content-length','cookie','cookie2','date','dnt','expect','host','keep-alive','origin','referer','te','trailer','transfer-encoding','upgrade','via']}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{},require("buffer").Buffer)},{"./capability":159,"./response":161,"_process":121,"buffer":48,"inherits":102,"readable-stream":144,"to-arraybuffer":164}],161:[function(require,module,exports){(function(process,global,Buffer){var capability=require('./capability')
var inherits=require('inherits')
var stream=require('readable-stream')
var rStates=exports.readyStates={UNSENT:0,OPENED:1,HEADERS_RECEIVED:2,LOADING:3,DONE:4}
var IncomingMessage=exports.IncomingMessage=function(xhr,response,mode,fetchTimer){var self=this
stream.Readable.call(self)
self._mode=mode
self.headers={}
self.rawHeaders=[]
self.trailers={}
self.rawTrailers=[]
self.on('end',function(){process.nextTick(function(){self.emit('close')})})
if(mode==='fetch'){self._fetchResponse=response
self.url=response.url
self.statusCode=response.status
self.statusMessage=response.statusText
response.headers.forEach(function(header,key){self.headers[key.toLowerCase()]=header
self.rawHeaders.push(key,header)})
if(capability.writableStream){var writable=new WritableStream({write:function(chunk){return new Promise(function(resolve,reject){if(self._destroyed){reject()}else if(self.push(new Buffer(chunk))){resolve()}else{self._resumeFetch=resolve}})},close:function(){global.clearTimeout(fetchTimer)
if(!self._destroyed)
self.push(null)},abort:function(err){if(!self._destroyed)
self.emit('error',err)}})
try{response.body.pipeTo(writable).catch(function(err){global.clearTimeout(fetchTimer)
if(!self._destroyed)
self.emit('error',err)})
return}catch(e){}}
function utf8CheckByte(byte){if(byte<=0x7F)return 0;else if(byte>>5===0x06)return 2;else if(byte>>4===0x0E)return 3;else if(byte>>3===0x1E)return 4;return byte>>6===0x02?-1:-2}
function utf8CheckIncomplete(self,buf,i){var j=buf.length-1;if(j<i)return 0;var nb=utf8CheckByte(buf[j]);if(nb>=0){if(nb>0)self.lastNeed=nb-1;return nb}
if(--j<i||nb===-2)return 0;nb=utf8CheckByte(buf[j]);if(nb>=0){if(nb>0)self.lastNeed=nb-2;return nb}
if(--j<i||nb===-2)return 0;nb=utf8CheckByte(buf[j]);if(nb>=0){if(nb>0){if(nb===2)nb=0;else self.lastNeed=nb-3}
return nb}
return 0}
function utf8CheckExtraBytes(self,buf,p){if((buf[0]&0xC0)!==0x80){self.lastNeed=0;return'\ufffd'}
if(self.lastNeed>1&&buf.length>1){if((buf[1]&0xC0)!==0x80){self.lastNeed=1;return'\ufffd'}
if(self.lastNeed>2&&buf.length>2){if((buf[2]&0xC0)!==0x80){self.lastNeed=2;return'\ufffd'}}}}
function utf8FillLast(buf){var p=this.lastTotal-this.lastNeed;var r=utf8CheckExtraBytes(this,buf,p);if(r!==undefined)return r;if(this.lastNeed<=buf.length){buf.copy(this.lastChar,p,0,this.lastNeed);return this.lastChar.toString(this.encoding,0,this.lastTotal)}
buf.copy(this.lastChar,p,0,buf.length);this.lastNeed-=buf.length}
exports.setImmediate=typeof setImmediate==="function"?setImmediate:function(fn){var id=nextImmediateId++;var args=arguments.length<2?!1:slice.call(arguments,1);immediateIds[id]=!0;nextTick(function onNextTick(){if(immediateIds[id]){if(args){fn.apply(null,args)}else{fn.call(null)}
exports.clearImmediate(id)}});return id};exports.clearImmediate=typeof clearImmediate==="function"?clearImmediate:function(id){delete immediateIds[id]}}).call(this,require("timers").setImmediate,require("timers").clearImmediate)},{"process/browser.js":121,"timers":163}],164:[function(require,module,exports){var Buffer=require('buffer').Buffer
module.exports=function(buf){if(buf instanceof Uint8Array){var hostEnd=-1;for(var i=0;i<hostEndingChars.length;i++){var hec=rest.indexOf(hostEndingChars[i]);if(hec!==-1&&(hostEnd===-1||hec<hostEnd))
hostEnd=hec}
var auth,atSign;if(hostEnd===-1){atSign=rest.lastIndexOf('@')}else{atSign=rest.lastIndexOf('@',hostEnd)}
if(atSign!==-1){auth=rest.slice(0,atSign);rest=rest.slice(atSign+1);this.auth=decodeURIComponent(auth)}
hostEnd=-1;for(var i=0;i<nonHostChars.length;i++){var hec=rest.indexOf(nonHostChars[i]);if(hec!==-1&&(hostEnd===-1||hec<hostEnd))
hostEnd=hec}
if(hostEnd===-1)
hostEnd=rest.length;this.host=rest.slice(0,hostEnd);rest=rest.slice(hostEnd);this.parseHost();this.hostname=this.hostname||'';this.hostname=punycode.toASCII(this.hostname)}
var p=this.port?':'+this.port:'';var h=this.hostname||'';this.host=h+p;this.href+=this.host;if(ipv6Hostname){this.hostname=this.hostname.substr(1,this.hostname.length-2);if(rest[0]!=='/'){rest='/'+rest}}}
if(!unsafeProtocol[lowerProto]){if(relative.href===''){result.href=result.format();return result}
if(relative.slashes&&!relative.protocol){var rkeys=Object.keys(relative);for(var rk=0;rk<rkeys.length;rk++){var rkey=rkeys[rk];if(rkey!=='protocol')
result[rkey]=relative[rkey]}
if(slashedProtocol[result.protocol]&&result.hostname&&!result.pathname){result.path=result.pathname='/'}
result.href=result.format();return result}
if(relative.protocol&&relative.protocol!==result.protocol){result.host=(relative.host||relative.host==='')?relative.host:result.host;result.hostname=(relative.hostname||relative.hostname==='')?relative.hostname:result.hostname;result.search=relative.search;result.query=relative.query;srcPath=relPath}else if(relPath.length){result.pathname=null;if(result.search){result.path='/'+result.search}else{result.path=null}
result.href=result.format();return result}
var last=srcPath.slice(-1)[0];var hasTrailingSlash=((result.host||relative.host||srcPath.length>1)&&(last==='.'||last==='..')||last==='');var up=0;for(var i=srcPath.length;i>=0;i--){last=srcPath[i];if(last==='.'){srcPath.splice(i,1)}else if(last==='..'){srcPath.splice(i,1);up++}else if(up){srcPath.splice(i,1);up--}}
if(!mustEndAbs&&!removeAllDots){for(;up--;up){srcPath.unshift('..')}}
if(mustEndAbs&&srcPath[0]!==''&&(!srcPath[0]||srcPath[0].charAt(0)!=='/')){srcPath.unshift('')}
if(hasTrailingSlash&&(srcPath.join('/').substr(-1)!=='/')){srcPath.push('')}
var isAbsolute=srcPath[0]===''||(srcPath[0]&&srcPath[0].charAt(0)==='/');if(psychotic){result.hostname=result.host=isAbsolute?'':srcPath.length?srcPath.shift():'';var authInHost=result.host&&result.host.indexOf('@')>0?result.host.split('@'):!1;if(authInHost){result.auth=authInHost.shift();result.host=result.hostname=authInHost.shift()}}
mustEndAbs=mustEndAbs||(result.host&&srcPath.length);if(mustEndAbs&&!isAbsolute){srcPath.unshift('')}
if(!srcPath.length){result.pathname=null;result.path=null}else{result.pathname=srcPath.join('/')}
if(!util.isNull(result.pathname)||!util.isNull(result.search)){result.path=(result.pathname?result.pathname:'')+(result.search?result.search:'')}
result.auth=relative.auth||result.auth;result.slashes=result.slashes||relative.slashes;result.href=result.format();return result};Url.prototype.parseHost=function(){var host=this.host;var port=portPattern.exec(host);if(port){port=port[0];if(port!==':'){this.port=port.substr(1)}
host=host.substr(0,host.length-port.length)}
if(host)this.hostname=host}},{"./util":166,"punycode":128,"querystring":131}],166:[function(require,module,exports){'use strict';module.exports={isString:function(arg){return typeof(arg)==='string'},isObject:function(arg){return typeof(arg)==='object'&&arg!==null},isNull:function(arg){return arg===null},isNullOrUndefined:function(arg){return arg==null}}},{}],167:[function(require,module,exports){(function(global){module.exports=deprecate;function deprecate(fn,msg){if(config('noDeprecation')){return fn}
var warned=!1;function deprecated(){if(!warned){if(config('throwDeprecation')){throw new Error(msg)}else if(config('traceDeprecation')){console.trace(msg)}else{console.warn(msg)}
warned=!0}
return fn.apply(this,arguments)}
return deprecated}
function config(name){try{if(!global.localStorage)return!1}catch(_){return!1}
var val=global.localStorage[name];if(null==val)return!1;return String(val).toLowerCase()==='true'}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],168:[function(require,module,exports){var indexOf=function(xs,item){if(xs.indexOf)return xs.indexOf(item);else for(var i=0;i<xs.length;i++){if(xs[i]===item)return i}
return-1};var Object_keys=function(obj){if(Object.keys)return Object.keys(obj)
else{var res=[];for(var key in obj)res.push(key)
return res}};var forEach=function(xs,fn){if(xs.forEach)return xs.forEach(fn)
else for(var i=0;i<xs.length;i++){fn(xs[i],i,xs)}};var defineProp=(function(){try{Object.defineProperty({},'_',{});return function(obj,name,value){Object.defineProperty(obj,name,{writable:!0,enumerable:!1,configurable:!0,value:value})}}catch(e){return function(obj,name,value){obj[name]=value}}}());var globals=['Array','Boolean','Date','Error','EvalError','Function','Infinity','JSON','Math','NaN','Number','Object','RangeError','ReferenceError','RegExp','String','SyntaxError','TypeError','URIError','decodeURI','decodeURIComponent','encodeURI','encodeURIComponent','escape','eval','isFinite','isNaN','parseFloat','parseInt','undefined','unescape'];function Context(){}
Context.prototype={};var Script=exports.Script=function NodeScript(code){if(!(this instanceof Script))return new Script(code);this.code=code};Script.prototype.runInContext=function(context){if(!(context instanceof Context)){throw new TypeError("needs a 'context' argument.")}
var iframe=document.createElement('iframe');if(!iframe.style)iframe.style={};iframe.style.display='none';document.body.appendChild(iframe);var win=iframe.contentWindow;var wEval=win.eval,wExecScript=win.execScript;if(!wEval&&wExecScript){wExecScript.call(win,'null');wEval=win.eval}
forEach(Object_keys(context),function(key){win[key]=context[key]});forEach(globals,function(key){if(context[key]){win[key]=context[key]}});var winKeys=Object_keys(win);var res=wEval.call(win,this.code);forEach(Object_keys(win),function(key){if(key in context||indexOf(winKeys,key)===-1){context[key]=win[key]}});forEach(globals,function(key){if(!(key in context)){defineProp(context,key,win[key])}});document.body.removeChild(iframe);return res};Script.prototype.runInThisContext=function(){return eval(this.code)};Script.prototype.runInNewContext=function(context){var ctx=Script.createContext(context);var res=this.runInContext(ctx);if(context){forEach(Object_keys(ctx),function(key){context[key]=ctx[key]})}
return res};forEach(Object_keys(Script.prototype),function(name){exports[name]=Script[name]=function(code){var s=Script(code);return s[name].apply(s,[].slice.call(arguments,1))}});exports.isContext=function(context){return context instanceof Context};exports.createScript=function(code){return exports.Script(code)};exports.createContext=Script.createContext=function(context){var copy=new Context();if(typeof context==='object'){forEach(Object_keys(context),function(key){copy[key]=context[key]})}
return copy}},{}],169:[function(require,module,exports){module.exports=extend
var hasOwnProperty=Object.prototype.hasOwnProperty;function extend(){var target={}
for(var i=0;i<arguments.length;i++){var source=arguments[i]
for(var key in source){if(hasOwnProperty.call(source,key)){target[key]=source[key]}}}
return target}},{}],170:[function(require,module,exports){Raiden=require('./lib/raiden.js')
module.exports=Raiden},{"./lib/raiden.js":176}],171:[function(require,module,exports){const XMLHttpRequest=require("xmlhttprequest").XMLHttpRequest;const AsyncHTTPRequest=(url,method,data,callback)=>{let request=new XMLHttpRequest();request.open(method,url,!0);request.setRequestHeader("Content-Type","application/json");request.onload=(e)=>{let parsed=JSON.parse(request.responseText);let error;if(request.responseText===undefined||request.responseText===''||(request.status!==200&&request.status!==201)){callback(undefined,parsed.errors)}else{callback(parsed,undefined)}};request.send(JSON.stringify(data));return request}
module.exports=AsyncHTTPRequest},{"xmlhttprequest":418}],172:[function(require,module,exports){const Web3=require("web3")
const HTTPRequest=require("./httpRequest.js")
const AsyncHTTPRequest=require("./AsyncHttpRequest.js")
function Channel(url){this.url=url}
Channel.prototype.getChannels=function(){let res=HTTPRequest(this.url+'/api/1/channels','GET')
if(res.status!==200){throw res.status+':Raiden internal error'}
return res.message}
Channel.prototype.getChannelsForToken=function(token){let checksum=Web3.utils.toChecksumAddress(token);let res=HTTPRequest(this.url+'/api/1/channels/'+checksum,'GET')
if(res.status!==200){throw res.status+':Raiden internal error'}
return res.message}
Channel.prototype.getChannelsAsync=function(callback){return AsyncHTTPRequest(this.url+'/api/1/channels','GET',null,callback)}
Channel.prototype.getChannelsForTokenAsync=function(token,callback){let checksum=Web3.utils.toChecksumAddress(token);return AsyncHTTPRequest(this.url+'/api/1/channels/'+checksum,'GET',null,callback)}
Channel.prototype.getChannel=function(token,partner){let checksum_token=Web3.utils.toChecksumAddress(token);let checksum_partner=Web3.utils.toChecksumAddress(partner);let res=HTTPRequest(this.url+'/api/1/channels/'+checksum_token+'/'+checksum_partner,'GET')
if(res.status!==200){throw res.message.errors}
return res.message}
Channel.prototype.getChannelAsync=function(token,partner,callback){let checksum_token=Web3.utils.toChecksumAddress(token);let checksum_partner=Web3.utils.toChecksumAddress(partner);return AsyncHTTPRequest(this.url+'/api/1/channels/'+checksum_token+'/'+checksum_partner,'GET',null,callback)}
Channel.prototype.getPartners=function(token){let checksum=Web3.utils.toChecksumAddress(token);let res=HTTPRequest(this.url+'/api/1/tokens/'+checksum+'/partners','GET')
switch(res.status){case 404:throw '404:Token Address not found or given token is not a valid EIP-55 Encoded Ethereum address';case 500:throw 'Internal Error'}
return res.message}
Channel.prototype.getPartnersAsync=function(token,callback){let checksum=Web3.utils.toChecksumAddress(token);return AsyncHTTPRequest(this.url+'/api/1/tokens/'+checksum+'/partners','GET',null,callback)}
Channel.prototype.openChannel=function(partner,token,deposit,settle_timeout,callback){let checksum_partner=Web3.utils.toChecksumAddress(partner);let checksum_token=Web3.utils.toChecksumAddress(token);return AsyncHTTPRequest(this.url+'/api/1/channels','PUT',{"partner_address":checksum_partner,"token_address":checksum_token,"total_deposit":deposit,"settle_timeout":settle_timeout},callback)}
Channel.prototype.closeChannel=function(token,partner,callback){let checksum_partner=Web3.utils.toChecksumAddress(partner);let checksum_token=Web3.utils.toChecksumAddress(token);let req=AsyncHTTPRequest(this.url+'/api/1/channels/'+checksum_token+"/"+checksum_partner,'PATCH',{"state":"closed"},callback);return req}
module.exports=Channel},{"./AsyncHttpRequest.js":171,"./httpRequest.js":174,"web3":402}],173:[function(require,module,exports){const Web3=require("web3")
const HTTPRequest=require("./httpRequest.js")
const AsyncHTTPRequest=require("./AsyncHttpRequest.js")
function Events(url){this.url=url}
Events.prototype.getTokenNetworksCreationEvents=function(){let res=HTTPRequest(this.url+'/api/1/_debug/blockchain_events/network','GET')
if(res.status!==200){throw JSON.stringify(res.message)}
return res.message}
Events.prototype.getTokenNetworksCreationEventsAsync=function(callback){return AsyncHTTPRequest(this.url+'/api/1/_debug/blockchain_events/network','GET',null,callback)}
Events.prototype.getTokenNetworkEvents=function(token){let token_checksum=Web3.utils.toChecksumAddress(token);let res;res=HTTPRequest(this.url+'/api/1/_debug/blockchain_events/tokens/'+token_checksum,'GET')
if(res.status!==200){throw JSON.stringify(res.message)}
return res.message}
Events.prototype.getChannelsEvents=function(token,partner){let token_checksum=Web3.utils.toChecksumAddress(token);let res;if(partner){let partner_checksum=Web3.utils.toChecksumAddress(partner);res=HTTPRequest(this.url+'/api/1/_debug/blockchain_events/payment_networks/'+token_checksum+'/channels/'+partner_checksum,'GET')}else{res=HTTPRequest(this.url+'/api/1/_debug/blockchain_events/payment_networks/'+token_checksum+'/channels','GET')}
if(res.status!==200){throw JSON.stringify(res.message)}
return res.message}
Events.prototype.getPaymentEventHistory=function(token,partner){let token_checksum=Web3.utils.toChecksumAddress(token);let partner_checksum=Web3.utils.toChecksumAddress(partner);let res=HTTPRequest(this.url+'/api/1/payments/'+token_checksum+'/'+partner_checksum,'GET')
if(res.status!==200){throw JSON.stringify(res.message)}
return res.message}
Events.prototype.getInternalEvents=function(){let res=HTTPRequest(this.url+'/api/1/_debug/raiden_events','GET')
if(res.status!==200){throw JSON.stringify(res.message)}
return res.message}
module.exports=Events},{"./AsyncHttpRequest.js":171,"./httpRequest.js":174,"web3":402}],174:[function(require,module,exports){const XMLHttpRequest=require("xmlhttprequest").XMLHttpRequest;const HTTPRequest=(url,method)=>{let request=new XMLHttpRequest();request.open(method,url,!1);request.send(null);let parsed;if(request.responseText===undefined){parsed=null}else{parsed=JSON.parse(request.responseText)}
return{"message":parsed,"status":request.status}}
module.exports=HTTPRequest},{"xmlhttprequest":418}],175:[function(require,module,exports){const XMLHttpRequest=require("xmlhttprequest").XMLHttpRequest;const getNodeAddress=function(url){let request=new XMLHttpRequest();request.open('GET',url+'/api/1/address',!1);request.send(null);if(request.responseText===undefined){throw JSON.stringify(request.statusText)}
let parsed=JSON.parse(request.responseText);return parsed.our_address}
function Provider(url){this.isConnected=function(){let request=new XMLHttpRequest();request.open('GET',this.url+'/api/1/address',!1);request.send(null);if(request.status===200)return!0
else return!1}
this.setProvider=function(url){this.url=url;try{this.address=getNodeAddress(this.url)}catch(e){this.address=e.toString(this.url)}}
this.setProvider(url)}
module.exports=Provider},{"xmlhttprequest":418}],176:[function(require,module,exports){const Provider=require('./provider.js')
const Token=require('./token.js');const Channel=require('./channel.js');const Events=require('./events.js');function Raiden(url){Provider.call(this,url);this.token=new Token(this.url);this.channel=new Channel(this.url);this.events=new Events(this.url)}
module.exports=Raiden},{"./channel.js":172,"./events.js":173,"./provider.js":175,"./token.js":177}],177:[function(require,module,exports){const Web3=require("web3")
const HTTPRequest=require("./httpRequest.js")
const AsyncHTTPRequest=require("./AsyncHttpRequest.js")
function Token(url){this.url=url}
Token.prototype.newTokenNetwork=function(token){let checksum=Web3.utils.toChecksumAddress(token);console.log(this.url+'/api/1/tokens/'+checksum)
let res=HTTPRequest(this.url+'/api/1/tokens/'+checksum,'PUT');switch(res.status){case 402:throw '402:Insufficient ETH to pay for the gas of the register on-chain transaction';case 404:throw '404:Not a valid EIP55 encoded address or method disabled';case 409:throw 'The token was already registered before,or The registering transaction failed.';case 501:throw 'Method disabled'}
return res.message.token_network_address}
Token.prototype.newTokenNetworkAsync=function(token,callback){let checksum=Web3.utils.toChecksumAddress(token);return AsyncHTTPRequest(this.url+'/api/1/tokens/'+checksum,'PUT',null,callback)}
Token.prototype.getRegisteredTokens=function(){let res=HTTPRequest(this.url+'/api/1/tokens','GET')
if(res.status!==200){throw res.status+':Raiden internal error'}
return res.message}
Token.prototype.getRegisteredTokensAsync=function(callback){return AsyncHTTPRequest(this.url+'/api/1/tokens','GET',null,callback)}
Token.prototype.getJoinedTokenNetworks=function(){let res=HTTPRequest(this.url+'/api/1/connections','GET')
if(res.status!==200){throw res.status+':Raiden internal error'}
return res.message}
Token.prototype.getJoinedTokenNetworksAsync=function(callback){return AsyncHTTPRequest(this.url+'/api/1/connections','GET',null,callback)}
Token.prototype.joinTokenNetwork=function(token,funds,callback){let checksum=Web3.utils.toChecksumAddress(token);return AsyncHTTPRequest(this.url+'/api/1/connections/'+checksum,'PUT',{"funds":funds},callback)}
Token.prototype.leaveTokenNetwork=function(token,callback){let checksum=Web3.utils.toChecksumAddress(token);let req=AsyncHTTPRequest(this.url+'/api/1/connections/'+checksum,'DELETE',null,callback)
setTimeout(function(){if(req.readyState===4)return;req.abort()
throw "The token network can't be closed due to timeout"},1000);return req}
Token.prototype.initPayment=function(tx,callback){tx.to=Web3.utils.toChecksumAddress(tx.to);tx.token=Web3.utils.toChecksumAddress(tx.token);return AsyncHTTPRequest(this.url+'/api/1/payments/'+tx.token+'/'+tx.to,'POST',{"amount":tx.value},callback)}
module.exports=Token},{"./AsyncHttpRequest.js":171,"./httpRequest.js":174,"web3":402}],178:[function(require,module,exports){module.exports=require('./register')().Promise},{"./register":180}],179:[function(require,module,exports){"use strict"
var REGISTRATION_KEY='@@any-promise/REGISTRATION',registered=null
module.exports=function(root,loadImplementation){return function register(implementation,opts){implementation=implementation||null
opts=opts||{}
var registerGlobal=opts.global!==!1;if(registered===null&&registerGlobal){registered=root[REGISTRATION_KEY]||null}
if(registered!==null&&implementation!==null&&registered.implementation!==implementation){throw new Error('any-promise already defined as "'+registered.implementation+'".  You can only register an implementation before the first '+' call to require("any-promise") and an implementation cannot be changed')}
if(registered===null){if(implementation!==null&&typeof opts.Promise!=='undefined'){registered={Promise:opts.Promise,implementation:implementation}}else{registered=loadImplementation(implementation)}
if(registerGlobal){root[REGISTRATION_KEY]=registered}}
return registered}}},{}],180:[function(require,module,exports){"use strict";module.exports=require('./loader')(window,loadImplementation)
function loadImplementation(){if(typeof window.Promise==='undefined'){throw new Error("any-promise browser requires a polyfill or explicit registration"+" e.g:require('any-promise/register/bluebird')")}
return{Promise:window.Promise,implementation:'window.Promise'}}},{"./loader":179}],181:[function(require,module,exports){arguments[4][2][0].apply(exports,arguments)},{"./asn1/api":182,"./asn1/base":184,"./asn1/constants":188,"./asn1/decoders":190,"./asn1/encoders":193,"bn.js":195,"dup":2}],182:[function(require,module,exports){arguments[4][3][0].apply(exports,arguments)},{"../asn1":181,"dup":3,"inherits":298,"vm":168}],183:[function(require,module,exports){arguments[4][4][0].apply(exports,arguments)},{"../base":184,"buffer":48,"dup":4,"inherits":298}],184:[function(require,module,exports){arguments[4][5][0].apply(exports,arguments)},{"./buffer":183,"./node":185,"./reporter":186,"dup":5}],185:[function(require,module,exports){arguments[4][6][0].apply(exports,arguments)},{"../base":184,"dup":6,"minimalistic-assert":304}],186:[function(require,module,exports){arguments[4][7][0].apply(exports,arguments)},{"dup":7,"inherits":298}],187:[function(require,module,exports){arguments[4][8][0].apply(exports,arguments)},{"../constants":188,"dup":8}],188:[function(require,module,exports){arguments[4][9][0].apply(exports,arguments)},{"./der":187,"dup":9}],189:[function(require,module,exports){arguments[4][10][0].apply(exports,arguments)},{"../../asn1":181,"dup":10,"inherits":298}],190:[function(require,module,exports){arguments[4][11][0].apply(exports,arguments)},{"./der":189,"./pem":191,"dup":11}],191:[function(require,module,exports){arguments[4][12][0].apply(exports,arguments)},{"./der":189,"buffer":48,"dup":12,"inherits":298}],192:[function(require,module,exports){arguments[4][13][0].apply(exports,arguments)},{"../../asn1":181,"buffer":48,"dup":13,"inherits":298}],193:[function(require,module,exports){arguments[4][14][0].apply(exports,arguments)},{"./der":192,"./pem":194,"dup":14}],194:[function(require,module,exports){arguments[4][15][0].apply(exports,arguments)},{"./der":192,"dup":15,"inherits":298}],195:[function(require,module,exports){arguments[4][17][0].apply(exports,arguments)},{"buffer":19,"dup":17}],196:[function(require,module,exports){arguments[4][18][0].apply(exports,arguments)},{"crypto":19,"dup":18}],197:[function(require,module,exports){arguments[4][20][0].apply(exports,arguments)},{"dup":20,"safe-buffer":334}],198:[function(require,module,exports){arguments[4][21][0].apply(exports,arguments)},{"./aes":197,"./ghash":202,"./incr32":203,"buffer-xor":224,"cipher-base":225,"dup":21,"inherits":298,"safe-buffer":334}],199:[function(require,module,exports){arguments[4][22][0].apply(exports,arguments)},{"./decrypter":200,"./encrypter":201,"./modes/list.json":211,"dup":22}],200:[function(require,module,exports){arguments[4][23][0].apply(exports,arguments)},{"./aes":197,"./authCipher":198,"./modes":210,"./streamCipher":213,"cipher-base":225,"dup":23,"evp_bytestokey":279,"inherits":298,"safe-buffer":334}],201:[function(require,module,exports){arguments[4][24][0].apply(exports,arguments)},{"./aes":197,"./authCipher":198,"./modes":210,"./streamCipher":213,"cipher-base":225,"dup":24,"evp_bytestokey":279,"inherits":298,"safe-buffer":334}],202:[function(require,module,exports){arguments[4][25][0].apply(exports,arguments)},{"dup":25,"safe-buffer":334}],203:[function(require,module,exports){arguments[4][26][0].apply(exports,arguments)},{"dup":26}],204:[function(require,module,exports){arguments[4][27][0].apply(exports,arguments)},{"buffer-xor":224,"dup":27}],205:[function(require,module,exports){arguments[4][28][0].apply(exports,arguments)},{"buffer-xor":224,"dup":28,"safe-buffer":334}],206:[function(require,module,exports){arguments[4][29][0].apply(exports,arguments)},{"dup":29,"safe-buffer":334}],207:[function(require,module,exports){arguments[4][30][0].apply(exports,arguments)},{"dup":30,"safe-buffer":334}],208:[function(require,module,exports){arguments[4][31][0].apply(exports,arguments)},{"../incr32":203,"buffer-xor":224,"dup":31,"safe-buffer":334}],209:[function(require,module,exports){arguments[4][32][0].apply(exports,arguments)},{"dup":32}],210:[function(require,module,exports){arguments[4][33][0].apply(exports,arguments)},{"./cbc":204,"./cfb":205,"./cfb1":206,"./cfb8":207,"./ctr":208,"./ecb":209,"./list.json":211,"./ofb":212,"dup":33}],211:[function(require,module,exports){arguments[4][34][0].apply(exports,arguments)},{"dup":34}],212:[function(require,module,exports){arguments[4][35][0].apply(exports,arguments)},{"buffer":48,"buffer-xor":224,"dup":35}],213:[function(require,module,exports){arguments[4][36][0].apply(exports,arguments)},{"./aes":197,"cipher-base":225,"dup":36,"inherits":298,"safe-buffer":334}],214:[function(require,module,exports){arguments[4][37][0].apply(exports,arguments)},{"browserify-aes/browser":199,"browserify-aes/modes":210,"browserify-des":215,"browserify-des/modes":216,"dup":37,"evp_bytestokey":279}],215:[function(require,module,exports){arguments[4][38][0].apply(exports,arguments)},{"cipher-base":225,"des.js":234,"dup":38,"inherits":298,"safe-buffer":334}],216:[function(require,module,exports){arguments[4][39][0].apply(exports,arguments)},{"dup":39}],217:[function(require,module,exports){arguments[4][40][0].apply(exports,arguments)},{"bn.js":195,"buffer":48,"dup":40,"randombytes":328}],218:[function(require,module,exports){arguments[4][41][0].apply(exports,arguments)},{"./browser/algorithms.json":219,"dup":41}],219:[function(require,module,exports){arguments[4][42][0].apply(exports,arguments)},{"dup":42}],220:[function(require,module,exports){arguments[4][43][0].apply(exports,arguments)},{"dup":43}],221:[function(require,module,exports){arguments[4][44][0].apply(exports,arguments)},{"./algorithms.json":219,"./sign":222,"./verify":223,"buffer":48,"create-hash":228,"dup":44,"inherits":298,"stream":157}],222:[function(require,module,exports){arguments[4][45][0].apply(exports,arguments)},{"./curves.json":220,"bn.js":195,"browserify-rsa":217,"buffer":48,"create-hmac":230,"dup":45,"elliptic":244,"parse-asn1":314}],223:[function(require,module,exports){arguments[4][46][0].apply(exports,arguments)},{"./curves.json":220,"bn.js":195,"buffer":48,"dup":46,"elliptic":244,"parse-asn1":314}],224:[function(require,module,exports){arguments[4][47][0].apply(exports,arguments)},{"buffer":48,"dup":47}],225:[function(require,module,exports){arguments[4][50][0].apply(exports,arguments)},{"dup":50,"inherits":298,"safe-buffer":334,"stream":157,"string_decoder":162}],226:[function(require,module,exports){(function(){"use strict";function CookieAccessInfo(domain,path,secure,script){if(this instanceof CookieAccessInfo){this.domain=domain||undefined;this.path=path||"/";this.secure=!!secure;this.script=!!script;return this}
return new CookieAccessInfo(domain,path,secure,script)}
CookieAccessInfo.All=Object.freeze(Object.create(null));exports.CookieAccessInfo=CookieAccessInfo;function Cookie(cookiestr,request_domain,request_path){if(cookiestr instanceof Cookie){return cookiestr}
if(this instanceof Cookie){this.name=null;this.value=null;this.expiration_date=Infinity;this.path=String(request_path||"/");this.explicit_path=!1;this.domain=request_domain||null;this.explicit_domain=!1;this.secure=!1;this.noscript=!1;if(cookiestr){this.parse(cookiestr,request_domain,request_path)}
return this}
return new Cookie(cookiestr,request_domain,request_path)}
exports.Cookie=Cookie;Cookie.prototype.toString=function toString(){var str=[this.name+"="+this.value];if(this.expiration_date!==Infinity){str.push("expires="+(new Date(this.expiration_date)).toGMTString())}
if(this.domain){str.push("domain="+this.domain)}
if(this.path){str.push("path="+this.path)}
if(this.secure){str.push("secure")}
if(this.noscript){str.push("httponly")}
return str.join(";")};Cookie.prototype.toValueString=function toValueString(){return this.name+"="+this.value};var cookie_str_splitter=/[:](?=\s*[a-zA-Z0-9_\-]+\s*[=])/g;Cookie.prototype.parse=function parse(str,request_domain,request_path){if(this instanceof Cookie){var parts=str.split(";").filter(function(value){return!!value});var i;var pair=parts[0].match(/([^=]+)=([\s\S]*)/);if(!pair){console.warn("Invalid cookie header encountered. Header:'"+str+"'");return}
var key=pair[1];var value=pair[2];if(typeof key!=='string'||key.length===0||typeof value!=='string'){console.warn("Unable to extract values from cookie header. Cookie:'"+str+"'");return}
this.name=key;this.value=value;for(i=1;i<parts.length;i+=1){pair=parts[i].match(/([^=]+)(?:=([\s\S]*))?/);key=pair[1].trim().toLowerCase();value=pair[2];switch(key){case "httponly":this.noscript=!0;break;case "expires":this.expiration_date=value?Number(Date.parse(value)):Infinity;break;case "path":this.path=value?value.trim():"";this.explicit_path=!0;break;case "domain":this.domain=value?value.trim():"";this.explicit_domain=!!this.domain;break;case "secure":this.secure=!0;break}}
if(!this.explicit_path){this.path=request_path||"/"}
if(!this.explicit_domain){this.domain=request_domain}
return this}
return new Cookie().parse(str,request_domain,request_path)};Cookie.prototype.matches=function matches(access_info){if(access_info===CookieAccessInfo.All){return!0}
if(this.noscript&&access_info.script||this.secure&&!access_info.secure||!this.collidesWith(access_info)){return!1}
return!0};Cookie.prototype.collidesWith=function collidesWith(access_info){if((this.path&&!access_info.path)||(this.domain&&!access_info.domain)){return!1}
if(this.path&&access_info.path.indexOf(this.path)!==0){return!1}
if(this.explicit_path&&access_info.path.indexOf(this.path)!==0){return!1}
var access_domain=access_info.domain&&access_info.domain.replace(/^[\.]/,'');var cookie_domain=this.domain&&this.domain.replace(/^[\.]/,'');if(cookie_domain===access_domain){return!0}
if(cookie_domain){if(!this.explicit_domain){return!1}
var wildcard=access_domain.indexOf(cookie_domain);if(wildcard===-1||wildcard!==access_domain.length-cookie_domain.length){return!1}
return!0}
return!0};function CookieJar(){var cookies,cookies_list,collidable_cookie;if(this instanceof CookieJar){cookies=Object.create(null);this.setCookie=function setCookie(cookie,request_domain,request_path){var remove,i;cookie=new Cookie(cookie,request_domain,request_path);remove=cookie.expiration_date<=Date.now();if(cookies[cookie.name]!==undefined){cookies_list=cookies[cookie.name];for(i=0;i<cookies_list.length;i+=1){collidable_cookie=cookies_list[i];if(collidable_cookie.collidesWith(cookie)){if(remove){cookies_list.splice(i,1);if(cookies_list.length===0){delete cookies[cookie.name]}
return!1}
cookies_list[i]=cookie;return cookie}}
if(remove){return!1}
cookies_list.push(cookie);return cookie}
if(remove){return!1}
cookies[cookie.name]=[cookie];return cookies[cookie.name]};this.getCookie=function getCookie(cookie_name,access_info){var cookie,i;cookies_list=cookies[cookie_name];if(!cookies_list){return}
for(i=0;i<cookies_list.length;i+=1){cookie=cookies_list[i];if(cookie.expiration_date<=Date.now()){if(cookies_list.length===0){delete cookies[cookie.name]}
continue}
if(cookie.matches(access_info)){return cookie}}};this.getCookies=function getCookies(access_info){var matches=[],cookie_name,cookie;for(cookie_name in cookies){cookie=this.getCookie(cookie_name,access_info);if(cookie){matches.push(cookie)}}
matches.toString=function toString(){return matches.join(":")};matches.toValueString=function toValueString(){return matches.map(function(c){return c.toValueString()}).join(';')};return matches};return this}
return new CookieJar()}
exports.CookieJar=CookieJar;CookieJar.prototype.setCookies=function setCookies(cookies,request_domain,request_path){cookies=Array.isArray(cookies)?cookies:cookies.split(cookie_str_splitter);var successful=[],i,cookie;cookies=cookies.map(function(item){return new Cookie(item,request_domain,request_path)});for(i=0;i<cookies.length;i+=1){cookie=cookies[i];if(this.setCookie(cookie,request_domain,request_path)){successful.push(cookie)}}
return successful}}())},{}],227:[function(require,module,exports){arguments[4][52][0].apply(exports,arguments)},{"bn.js":195,"buffer":48,"dup":52,"elliptic":244}],228:[function(require,module,exports){arguments[4][53][0].apply(exports,arguments)},{"cipher-base":225,"dup":53,"inherits":298,"md5.js":302,"ripemd160":333,"sha.js":338}],229:[function(require,module,exports){arguments[4][54][0].apply(exports,arguments)},{"dup":54,"md5.js":302}],230:[function(require,module,exports){arguments[4][55][0].apply(exports,arguments)},{"./legacy":231,"cipher-base":225,"create-hash/md5":229,"dup":55,"inherits":298,"ripemd160":333,"safe-buffer":334,"sha.js":338}],231:[function(require,module,exports){arguments[4][56][0].apply(exports,arguments)},{"cipher-base":225,"dup":56,"inherits":298,"safe-buffer":334}],232:[function(require,module,exports){arguments[4][57][0].apply(exports,arguments)},{"browserify-cipher":214,"browserify-sign":221,"browserify-sign/algos":218,"create-ecdh":227,"create-hash":228,"create-hmac":230,"diffie-hellman":240,"dup":57,"pbkdf2":316,"public-encrypt":321,"randombytes":328,"randomfill":329}],233:[function(require,module,exports){'use strict';var token='%[a-f0-9]{2}';var singleMatcher=new RegExp(token,'gi');var multiMatcher=new RegExp('('+token+')+','gi');function decodeComponents(components,split){try{return decodeURIComponent(components.join(''))}catch(err){}
if(components.length===1){return components}
split=split||1;var left=components.slice(0,split);var right=components.slice(split);return Array.prototype.concat.call([],decodeComponents(left),decodeComponents(right))}
function decode(input){try{return decodeURIComponent(input)}catch(err){var tokens=input.match(singleMatcher);for(var i=1;i<tokens.length;i++){input=decodeComponents(tokens,i).join('');tokens=input.match(singleMatcher)}
return input}}
function customDecodeURIComponent(input){var replaceMap={'%FE%FF':'\uFFFD\uFFFD','%FF%FE':'\uFFFD\uFFFD'};var match=multiMatcher.exec(input);while(match){try{replaceMap[match[0]]=decodeURIComponent(match[0])}catch(err){var result=decode(match[0]);if(result!==match[0]){replaceMap[match[0]]=result}}
match=multiMatcher.exec(input)}
replaceMap['%C2']='\uFFFD';var entries=Object.keys(replaceMap);for(var i=0;i<entries.length;i++){var key=entries[i];input=input.replace(new RegExp(key,'g'),replaceMap[key])}
return input}
module.exports=function(encodedURI){if(typeof encodedURI!=='string'){throw new TypeError('Expected `encodedURI` to be of type `string`, got `'+typeof encodedURI+'`')}
try{encodedURI=encodedURI.replace(/\+/g,' ');return decodeURIComponent(encodedURI)}catch(err){return customDecodeURIComponent(encodedURI)}}},{}],234:[function(require,module,exports){arguments[4][58][0].apply(exports,arguments)},{"./des/cbc":235,"./des/cipher":236,"./des/des":237,"./des/ede":238,"./des/utils":239,"dup":58}],235:[function(require,module,exports){arguments[4][59][0].apply(exports,arguments)},{"dup":59,"inherits":298,"minimalistic-assert":304}],236:[function(require,module,exports){arguments[4][60][0].apply(exports,arguments)},{"dup":60,"minimalistic-assert":304}],237:[function(require,module,exports){arguments[4][61][0].apply(exports,arguments)},{"../des":234,"dup":61,"inherits":298,"minimalistic-assert":304}],238:[function(require,module,exports){arguments[4][62][0].apply(exports,arguments)},{"../des":234,"dup":62,"inherits":298,"minimalistic-assert":304}],239:[function(require,module,exports){arguments[4][63][0].apply(exports,arguments)},{"dup":63}],240:[function(require,module,exports){arguments[4][64][0].apply(exports,arguments)},{"./lib/dh":241,"./lib/generatePrime":242,"./lib/primes.json":243,"buffer":48,"dup":64}],241:[function(require,module,exports){arguments[4][65][0].apply(exports,arguments)},{"./generatePrime":242,"bn.js":195,"buffer":48,"dup":65,"miller-rabin":303,"randombytes":328}],242:[function(require,module,exports){arguments[4][66][0].apply(exports,arguments)},{"bn.js":195,"dup":66,"miller-rabin":303,"randombytes":328}],243:[function(require,module,exports){arguments[4][67][0].apply(exports,arguments)},{"dup":67}],244:[function(require,module,exports){arguments[4][68][0].apply(exports,arguments)},{"../package.json":259,"./elliptic/curve":247,"./elliptic/curves":250,"./elliptic/ec":251,"./elliptic/eddsa":254,"./elliptic/utils":258,"brorand":196,"dup":68}],245:[function(require,module,exports){arguments[4][69][0].apply(exports,arguments)},{"../../elliptic":244,"bn.js":195,"dup":69}],246:[function(require,module,exports){arguments[4][70][0].apply(exports,arguments)},{"../../elliptic":244,"../curve":247,"bn.js":195,"dup":70,"inherits":298}],247:[function(require,module,exports){arguments[4][71][0].apply(exports,arguments)},{"./base":245,"./edwards":246,"./mont":248,"./short":249,"dup":71}],248:[function(require,module,exports){arguments[4][72][0].apply(exports,arguments)},{"../../elliptic":244,"../curve":247,"bn.js":195,"dup":72,"inherits":298}],249:[function(require,module,exports){arguments[4][73][0].apply(exports,arguments)},{"../../elliptic":244,"../curve":247,"bn.js":195,"dup":73,"inherits":298}],250:[function(require,module,exports){arguments[4][74][0].apply(exports,arguments)},{"../elliptic":244,"./precomputed/secp256k1":257,"dup":74,"hash.js":283}],251:[function(require,module,exports){arguments[4][75][0].apply(exports,arguments)},{"../../elliptic":244,"./key":252,"./signature":253,"bn.js":195,"dup":75,"hmac-drbg":295}],252:[function(require,module,exports){arguments[4][76][0].apply(exports,arguments)},{"../../elliptic":244,"bn.js":195,"dup":76}],253:[function(require,module,exports){arguments[4][77][0].apply(exports,arguments)},{"../../elliptic":244,"bn.js":195,"dup":77}],254:[function(require,module,exports){arguments[4][78][0].apply(exports,arguments)},{"../../elliptic":244,"./key":255,"./signature":256,"dup":78,"hash.js":283}],255:[function(require,module,exports){arguments[4][79][0].apply(exports,arguments)},{"../../elliptic":244,"dup":79}],256:[function(require,module,exports){arguments[4][80][0].apply(exports,arguments)},{"../../elliptic":244,"bn.js":195,"dup":80}],257:[function(require,module,exports){arguments[4][81][0].apply(exports,arguments)},{"dup":81}],258:[function(require,module,exports){arguments[4][82][0].apply(exports,arguments)},{"bn.js":195,"dup":82,"minimalistic-assert":304,"minimalistic-crypto-utils":305}],259:[function(require,module,exports){module.exports={"_from":"elliptic@^6.4.0","_id":"elliptic@6.4.1","_inBundle":!1,"_integrity":"sha512-BsXLz5sqX8OHcsh7CqBMztyXARmGQ3LWPtGjJi6DiJHq5C/qvi9P3OqgswKSDftbu8+IoI/QDTAm2fFnQ9SZSQ==","_location":"/elliptic","_phantomChildren":{},"_requested":{"type":"range","registry":!0,"raw":"elliptic@^6.4.0","name":"elliptic","escapedName":"elliptic","rawSpec":"^6.4.0","saveSpec":null,"fetchSpec":"^6.4.0"},"_requiredBy":["/browserify-sign","/create-ecdh","/eth-lib","/web3-eth-accounts/eth-lib"],"_resolved":"https://registry.npmjs.org/elliptic/-/elliptic-6.4.1.tgz","_shasum":"c2d0b7776911b86722c632c3c06c60f2f819939a","_spec":"elliptic@^6.4.0","_where":"/home/giulio/raiden-js/node_modules/eth-lib","author":{"name":"Fedor Indutny","email":"fedor@indutny.com"},"bugs":{"url":"https://github.com/indutny/elliptic/issues"},"bundleDependencies":!1,"dependencies":{"bn.js":"^4.4.0","brorand":"^1.0.1","hash.js":"^1.0.0","hmac-drbg":"^1.0.0","inherits":"^2.0.1","minimalistic-assert":"^1.0.0","minimalistic-crypto-utils":"^1.0.0"},"deprecated":!1,"description":"EC cryptography","devDependencies":{"brfs":"^1.4.3","coveralls":"^2.11.3","grunt":"^0.4.5","grunt-browserify":"^5.0.0","grunt-cli":"^1.2.0","grunt-contrib-connect":"^1.0.0","grunt-contrib-copy":"^1.0.0","grunt-contrib-uglify":"^1.0.1","grunt-mocha-istanbul":"^3.0.1","grunt-saucelabs":"^8.6.2","istanbul":"^0.4.2","jscs":"^2.9.0","jshint":"^2.6.0","mocha":"^2.1.0"},"files":["lib"],"homepage":"https://github.com/indutny/elliptic","keywords":["EC","Elliptic","curve","Cryptography"],"license":"MIT","main":"lib/elliptic.js","name":"elliptic","repository":{"type":"git","url":"git+ssh://git@github.com/indutny/elliptic.git"},"scripts":{"jscs":"jscs benchmarks*.js lib***.js lib** (function (){'use strict';;var NODE_JS=!root.JS_SHA3_NO_NODE_JS && typeof process==='object' && process.versions && process.versions.node;if (NODE_JS){root=global}var COMMON_JS=!root.JS_SHA3_NO_COMMON_JS && typeof module==='object' && module.exports;var HEX_CHARS='0123456789abcdef'.split('');var SHAKE_PADDING=[31,7936,2031616,520093696];var KECCAK_PADDING=[1,256,65536,16777216];var PADDING=[6,1536,393216,100663296];var SHIFT=[0,8,16,24];var RC=[1,0,32898,0,32906,2147483648,2147516416,2147483648,32907,0,2147483649,0,2147516545,2147483648,32777,2147483648,138,0,136,0,2147516425,0,2147483658,0,2147516555,0,139,2147483648,32905,2147483648,32771,2147483648,32770,2147483648,128,2147483648,32778,0,2147483658,2147483648,2147516545,2147483648,32896,2147483648,2147483649,0,2147516424,2147483648];var BITS=[224,256,384,512];var SHAKE_BITS=[128,256];var OUTPUT_TYPES=['hex','buffer','arrayBuffer','array'];var createOutputMethod=function (bits,padding,outputType){return function (message){return new Keccak(bits,padding,bits).update(message)[outputType]()}};var createShakeOutputMethod=function (bits,padding,outputType){return function (message,outputBits){return new Keccak(bits,padding,outputBits).update(message)[outputType]()}};var createMethod=function (bits,padding){var method=createOutputMethod(bits,padding,'hex');method.create=function (){return new Keccak(bits,padding,bits)};method.update=function (message){return method.create().update(message)};for (var i=0;i < OUTPUT_TYPES.length;++i){var type=OUTPUT_TYPES[i];method[type]=createOutputMethod(bits,padding,type)}return method};var createShakeMethod=function (bits,padding){var method=createShakeOutputMethod(bits,padding,'hex');method.create=function (outputBits){return new Keccak(bits,padding,outputBits)};method.update=function (message,outputBits){return method.create(outputBits).update(message)};for (var i=0;i < OUTPUT_TYPES.length;++i){var type=OUTPUT_TYPES[i];method[type]=createShakeOutputMethod(bits,padding,type)}return method};var algorithms=[{name:'keccak',padding:KECCAK_PADDING,bits:BITS,createMethod:createMethod},{name:'sha3',padding:PADDING,bits:BITS,createMethod:createMethod},{name:'shake',padding:SHAKE_PADDING,bits:SHAKE_BITS,createMethod:createShakeMethod}];,methodNames=[];for (var i=0;i < algorithms.length;++i){var algorithm=algorithms[i];var bits=algorithm.bits;for (var j=0;j < bits.length;++j){var methodName=algorithm.name +'_' + bits[j];methodNames.push(methodName);methods[methodName]=algorithm.createMethod(bits[j],algorithm.padding)}}function Keccak(bits,padding,outputBits){this.blocks=[];this.s=[];this.padding=padding;this.outputBits=outputBits;this.reset=true;this.block=0;this.start=0;this.blockCount=(1600 - (bits << 1))>>5;this.byteCount=this.blockCount << 2;this.outputBlocks=outputBits>>5;this.extraBytes=(outputBits & 31)>>3;for (var i=0;i < 50;++i){this.s[i]=0}}Keccak.prototype.update=function (message){var notString=typeof message !=='string';if (notString && message.constructor===ArrayBuffer){message=new Uint8Array(message)}var length=message.length,blocks=this.blocks,byteCount=this.byteCount,blockCount=this.blockCount,index=0,s=this.s,i,code;while (index < length){if (this.reset){this.reset=false;blocks[0]=this.block;for (i=1;i < blockCount + 1;++i){blocks[i]=0}}if (notString){for (i=this.start;index < length && i < byteCount;++index){blocks[i>>2]|=message[index] << SHIFT[i++ & 3]}}else{for (i=this.start;index < length && i < byteCount;++index){code=message.charCodeAt(index);if (code < 0x80){blocks[i>>2]|=code << SHIFT[i++ & 3]}else if (code < 0x800){blocks[i>>2]|=(0xc0 | (code>>6)) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | (code & 0x3f)) << SHIFT[i++ & 3]}else if (code < 0xd800 || code>=0xe000){blocks[i>>2]|=(0xe0 | (code>>12)) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | ((code>>6) & 0x3f)) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | (code & 0x3f)) << SHIFT[i++ & 3]}else{code=0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));blocks[i>>2]|=(0xf0 | (code>>18)) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | ((code>>12) & 0x3f)) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | ((code>>6) & 0x3f)) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | (code & 0x3f)) << SHIFT[i++ & 3]}}}this.lastByteIndex=i;if (i>=byteCount){this.start=i - byteCount;this.block=blocks[blockCount];for (i=0;i < blockCount;++i){s[i]^=blocks[i]}f(s);this.reset=true}else{this.start=i}}return this};Keccak.prototype.finalize=function (){var blocks=this.blocks,i=this.lastByteIndex,blockCount=this.blockCount,s=this.s;blocks[i>>2]|=this.padding[i & 3];if (this.lastByteIndex===this.byteCount){blocks[0]=blocks[blockCount];for (i=1;i < blockCount + 1;++i){blocks[i]=0}}blocks[blockCount - 1]|=0x80000000;for (i=0;i < blockCount;++i){s[i]^=blocks[i]}f(s)};Keccak.prototype.toString=Keccak.prototype.hex=function (){this.finalize();var blockCount=this.blockCount,s=this.s,outputBlocks=this.outputBlocks,extraBytes=this.extraBytes,i=0,j=0;var hex='',block;while (j < outputBlocks){for (i=0;i < blockCount && j < outputBlocks;++i,++j){block=s[i];hex +=HEX_CHARS[(block>>4) & 0x0F] + HEX_CHARS[block & 0x0F] + HEX_CHARS[(block>>12) & 0x0F] + HEX_CHARS[(block>>8) & 0x0F] + HEX_CHARS[(block>>20) & 0x0F] + HEX_CHARS[(block>>16) & 0x0F] + HEX_CHARS[(block>>28) & 0x0F] + HEX_CHARS[(block>>24) & 0x0F]}if (j % blockCount===0){f(s);i=0}}if (extraBytes){block=s[i];if (extraBytes>0){hex +=HEX_CHARS[(block>>4) & 0x0F] + HEX_CHARS[block & 0x0F]}if (extraBytes>1){hex +=HEX_CHARS[(block>>12) & 0x0F] + HEX_CHARS[(block>>8) & 0x0F]}if (extraBytes>2){hex +=HEX_CHARS[(block>>20) & 0x0F] + HEX_CHARS[(block>>16) & 0x0F]}}return hex};Keccak.prototype.arrayBuffer=function (){this.finalize();var blockCount=this.blockCount,s=this.s,outputBlocks=this.outputBlocks,extraBytes=this.extraBytes,i=0,j=0;var bytes=this.outputBits>>3;var buffer;if (extraBytes){buffer=new ArrayBuffer((outputBlocks + 1) << 2)}else{buffer=new ArrayBuffer(bytes)}var array=new Uint32Array(buffer);while (j < outputBlocks){for (i=0;i < blockCount && j < outputBlocks;++i,++j){array[j]=s[i]}if (j % blockCount===0){f(s)}}if (extraBytes){array[i]=s[i];buffer=buffer.slice(0,bytes)}return buffer};Keccak.prototype.buffer=Keccak.prototype.arrayBuffer;Keccak.prototype.digest=Keccak.prototype.array=function (){this.finalize();var blockCount=this.blockCount,s=this.s,outputBlocks=this.outputBlocks,extraBytes=this.extraBytes,i=0,j=0;var array=[],offset,block;while (j < outputBlocks){for (i=0;i < blockCount && j < outputBlocks;++i,++j){offset=j << 2;block=s[i];array[offset]=block & 0xFF;array[offset + 1]=(block>>8) & 0xFF;array[offset + 2]=(block>>16) & 0xFF;array[offset + 3]=(block>>24) & 0xFF}if (j % blockCount===0){f(s)}}if (extraBytes){offset=j << 2;block=s[i];if (extraBytes>0){array[offset]=block & 0xFF}if (extraBytes>1){array[offset + 1]=(block>>8) & 0xFF}if (extraBytes>2){array[offset + 2]=(block>>16) & 0xFF}}return array};var f=function (s){var h,l,n,c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12,b13,b14,b15,b16,b17,b18,b19,b20,b21,b22,b23,b24,b25,b26,b27,b28,b29,b30,b31,b32,b33,b34,b35,b36,b37,b38,b39,b40,b41,b42,b43,b44,b45,b46,b47,b48,b49;for (n=0;n < 48;n +=2){c0=s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];c1=s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];c2=s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];c3=s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];c4=s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];c5=s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];c6=s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];c7=s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];c8=s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];c9=s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];h=c8 ^ ((c2 << 1) | (c3>>>31));l=c9 ^ ((c3 << 1) | (c2>>>31));s[0]^=h;s[1]^=l;s[10]^=h;s[11]^=l;s[20]^=h;s[21]^=l;s[30]^=h;s[31]^=l;s[40]^=h;s[41]^=l;h=c0 ^ ((c4 << 1) | (c5>>>31));l=c1 ^ ((c5 << 1) | (c4>>>31));s[2]^=h;s[3]^=l;s[12]^=h;s[13]^=l;s[22]^=h;s[23]^=l;s[32]^=h;s[33]^=l;s[42]^=h;s[43]^=l;h=c2 ^ ((c6 << 1) | (c7>>>31));l=c3 ^ ((c7 << 1) | (c6>>>31));s[4]^=h;s[5]^=l;s[14]^=h;s[15]^=l;s[24]^=h;s[25]^=l;s[34]^=h;s[35]^=l;s[44]^=h;s[45]^=l;h=c4 ^ ((c8 << 1) | (c9>>>31));l=c5 ^ ((c9 << 1) | (c8>>>31));s[6]^=h;s[7]^=l;s[16]^=h;s[17]^=l;s[26]^=h;s[27]^=l;s[36]^=h;s[37]^=l;s[46]^=h;s[47]^=l;h=c6 ^ ((c0 << 1) | (c1>>>31));l=c7 ^ ((c1 << 1) | (c0>>>31));s[8]^=h;s[9]^=l;s[18]^=h;s[19]^=l;s[28]^=h;s[29]^=l;s[38]^=h;s[39]^=l;s[48]^=h;s[49]^=l;b0=s[0];b1=s[1];b32=(s[11] << 4) | (s[10]>>>28);b33=(s[10] << 4) | (s[11]>>>28);b14=(s[20] << 3) | (s[21]>>>29);b15=(s[21] << 3) | (s[20]>>>29);b46=(s[31] << 9) | (s[30]>>>23);b47=(s[30] << 9) | (s[31]>>>23);b28=(s[40] << 18) | (s[41]>>>14);b29=(s[41] << 18) | (s[40]>>>14);b20=(s[2] << 1) | (s[3]>>>31);b21=(s[3] << 1) | (s[2]>>>31);b2=(s[13] << 12) | (s[12]>>>20);b3=(s[12] << 12) | (s[13]>>>20);b34=(s[22] << 10) | (s[23]>>>22);b35=(s[23] << 10) | (s[22]>>>22);b16=(s[33] << 13) | (s[32]>>>19);b17=(s[32] << 13) | (s[33]>>>19);b48=(s[42] << 2) | (s[43]>>>30);b49=(s[43] << 2) | (s[42]>>>30);b40=(s[5] << 30) | (s[4]>>>2);b41=(s[4] << 30) | (s[5]>>>2);b22=(s[14] << 6) | (s[15]>>>26);b23=(s[15] << 6) | (s[14]>>>26);b4=(s[25] << 11) | (s[24]>>>21);b5=(s[24] << 11) | (s[25]>>>21);b36=(s[34] << 15) | (s[35]>>>17);b37=(s[35] << 15) | (s[34]>>>17);b18=(s[45] << 29) | (s[44]>>>3);b19=(s[44] << 29) | (s[45]>>>3);b10=(s[6] << 28) | (s[7]>>>4);b11=(s[7] << 28) | (s[6]>>>4);b42=(s[17] << 23) | (s[16]>>>9);b43=(s[16] << 23) | (s[17]>>>9);b24=(s[26] << 25) | (s[27]>>>7);b25=(s[27] << 25) | (s[26]>>>7);b6=(s[36] << 21) | (s[37]>>>11);b7=(s[37] << 21) | (s[36]>>>11);b38=(s[47] << 24) | (s[46]>>>8);b39=(s[46] << 24) | (s[47]>>>8);b30=(s[8] << 27) | (s[9]>>>5);b31=(s[9] << 27) | (s[8]>>>5);b12=(s[18] << 20) | (s[19]>>>12);b13=(s[19] << 20) | (s[18]>>>12);b44=(s[29] << 7) | (s[28]>>>25);b45=(s[28] << 7) | (s[29]>>>25);b26=(s[38] << 8) | (s[39]>>>24);b27=(s[39] << 8) | (s[38]>>>24);b8=(s[48] << 14) | (s[49]>>>18);b9=(s[49] << 14) | (s[48]>>>18);s[0]=b0 ^ (~b2 & b4);s[1]=b1 ^ (~b3 & b5);s[10]=b10 ^ (~b12 & b14);s[11]=b11 ^ (~b13 & b15);s[20]=b20 ^ (~b22 & b24);s[21]=b21 ^ (~b23 & b25);s[30]=b30 ^ (~b32 & b34);s[31]=b31 ^ (~b33 & b35);s[40]=b40 ^ (~b42 & b44);s[41]=b41 ^ (~b43 & b45);s[2]=b2 ^ (~b4 & b6);s[3]=b3 ^ (~b5 & b7);s[12]=b12 ^ (~b14 & b16);s[13]=b13 ^ (~b15 & b17);s[22]=b22 ^ (~b24 & b26);s[23]=b23 ^ (~b25 & b27);s[32]=b32 ^ (~b34 & b36);s[33]=b33 ^ (~b35 & b37);s[42]=b42 ^ (~b44 & b46);s[43]=b43 ^ (~b45 & b47);s[4]=b4 ^ (~b6 & b8);s[5]=b5 ^ (~b7 & b9);s[14]=b14 ^ (~b16 & b18);s[15]=b15 ^ (~b17 & b19);s[24]=b24 ^ (~b26 & b28);s[25]=b25 ^ (~b27 & b29);s[34]=b34 ^ (~b36 & b38);s[35]=b35 ^ (~b37 & b39);s[44]=b44 ^ (~b46 & b48);s[45]=b45 ^ (~b47 & b49);s[6]=b6 ^ (~b8 & b0);s[7]=b7 ^ (~b9 & b1);s[16]=b16 ^ (~b18 & b10);s[17]=b17 ^ (~b19 & b11);s[26]=b26 ^ (~b28 & b20);s[27]=b27 ^ (~b29 & b21);s[36]=b36 ^ (~b38 & b30);s[37]=b37 ^ (~b39 & b31);s[46]=b46 ^ (~b48 & b40);s[47]=b47 ^ (~b49 & b41);s[8]=b8 ^ (~b0 & b2);s[9]=b9 ^ (~b1 & b3);s[18]=b18 ^ (~b10 & b12);s[19]=b19 ^ (~b11 & b13);s[28]=b28 ^ (~b20 & b22);s[29]=b29 ^ (~b21 & b23);s[38]=b38 ^ (~b30 & b32);s[39]=b39 ^ (~b31 & b33);s[48]=b48 ^ (~b40 & b42);s[49]=b49 ^ (~b41 & b43);s[0]^=RC[n];s[1]^=RC[n + 1]}};if (COMMON_JS){module.exports=methods}else{for (var i=0;i < methodNames.length;++i){root[methodNames[i]]=methods[methodNames[i]]}}})()})},{"_process":121}],262:[function(require,module,exports){var generate=function generate(num,fn){var a=[];for (var i=0;i < num;++i){a.push(fn(i))}return a};var replicate=function replicate(num,val){return generate(num,function (){return val})};var concat=function concat(a,b){return a.concat(b)};var flatten=function flatten(a){var r=[];for (var j=0,J=a.length;j < J;++j){for (var i=0,I=a[j].length;i < I;++i){r.push(a[j][i])}}return r};var chunksOf=function chunksOf(n,a){var b=[];for (var i=0,l=a.length;i < l;i +=n){b.push(a.slice(i,i + n))}return b};module.exports={generate:generate,replicate:replicate,concat:concat,flatten:flatten,chunksOf:chunksOf}}],263:[function(require,module,exports){var A=require("./array.js");var at=function at(bytes,index){return parseInt(bytes.slice(index * 2 + 2,index * 2 + 4),16)};var random=function random(bytes){var rnd=void 0;if (typeof window !=="undefined" && window.crypto && window.crypto.getRandomValues) rnd=window.crypto.getRandomValues(new Uint8Array(bytes));else if (typeof require !=="undefined") rnd=require("c" + "rypto").randomBytes(bytes);else throw "Safe random numbers not available.";var hex="0x";for (var i=0;i < bytes;++i){hex +=("00" + rnd[i].toString(16)).slice(-2)}return hex};var length=function length(a){return (a.length - 2) / 2};var flatten=function flatten(a){return "0x" + a.reduce(function (r,s){return r + s.slice(2)},"")};var slice=function slice(i,j,bs){return "0x" + bs.slice(i * 2 + 2,j * 2 + 2)};var reverse=function reverse(hex){var rev="0x";for (var i=0,l=length(hex);i < l;++i){rev +=hex.slice((l - i) * 2,(l - i + 1) * 2)}return rev};var pad=function pad(l,hex){return hex.length===l * 2 + 2 ? hex:pad(l,"0x" + "0" + hex.slice(2))};var padRight=function padRight(l,hex){return hex.length===l * 2 + 2 ? hex:padRight(l,hex + "0")};var toArray=function toArray(hex){var arr=[];for (var i=2,l=hex.length;i < l;i +=2){arr.push(parseInt(hex.slice(i,i + 2),16))}return arr};var fromArray=function fromArray(arr){var hex="0x";for (var i=0,l=arr.length;i < l;++i){var b=arr[i];hex +=(b < 16 ? "0":"") + b.toString(16)}return hex};var toUint8Array=function toUint8Array(hex){return new Uint8Array(toArray(hex))};var fromUint8Array=function fromUint8Array(arr){return fromArray([].slice.call(arr,0))};var fromNumber=function fromNumber(num){var hex=num.toString(16);return hex.length % 2===0 ? "0x" + hex:"0x0" + hex};var toNumber=function toNumber(hex){return parseInt(hex.slice(2),16)};var concat=function concat(a,b){return a.concat(b.slice(2))};var fromNat=function fromNat(bn){return bn==="0x0" ? "0x":bn.length % 2===0 ? bn:"0x0" + bn.slice(2)};var toNat=function toNat(bn){return bn[2]==="0" ? "0x" + bn.slice(3):bn};var fromAscii=function fromAscii(ascii){var hex="0x";for (var i=0;i < ascii.length;++i){hex +=("00" + ascii.charCodeAt(i).toString(16)).slice(-2)}return hex};var toAscii=function toAscii(hex){var ascii="";for (var i=2;i < hex.length;i +=2){ascii +=String.fromCharCode(parseInt(hex.slice(i,i + 2),16))}return ascii};// From https://gist.github.com/pascaldekloe/62546103a1576803dade9269ccf76330 var fromString=function fromString(s){var makeByte=function makeByte(uint8){var b=uint8.toString(16);return b.length < 2 ? "0" + b:b};var bytes="0x";for (var ci=0;ci !=s.length;ci++){var c=s.charCodeAt(ci);if (c < 128){bytes +=makeByte(c);continue}if (c < 2048){bytes +=makeByte(c>>6 | 192)}else{if (c>0xd7ff && c < 0xdc00){if (++ci==s.length) return null;var c2=s.charCodeAt(ci);if (c2 < 0xdc00 || c2>0xdfff) return null;c=0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);bytes +=makeByte(c>>18 | 240);bytes +=makeByte(c>>12 & 63 | 128)}else{// c <=0xffff bytes +=makeByte(c>>12 | 224)}bytes +=makeByte(c>>6 & 63 | 128)}bytes +=makeByte(c & 63 | 128)}return bytes};var toString=function toString(bytes){var s='';var i=0;var l=length(bytes);while (i < l){var c=at(bytes,i++);if (c>127){if (c>191 && c < 224){if (i>=l) return null;c=(c & 31) << 6 | at(bytes,i) & 63}else if (c>223 && c < 240){if (i + 1>=l) return null;c=(c & 15) << 12 | (at(bytes,i) & 63) << 6 | at(bytes,++i) & 63}else if (c>239 && c < 248){if (i + 2>=l) return null;c=(c & 7) << 18 | (at(bytes,i) & 63) << 12 | (at(bytes,++i) & 63) << 6 | at(bytes,++i) & 63}else return null;++i}if (c <=0xffff) s +=String.fromCharCode(c);else if (c <=0x10ffff){c -=0x10000;s +=String.fromCharCode(c>>10 | 0xd800);s +=String.fromCharCode(c & 0x3FF | 0xdc00)}else return null}return s};module.exports={random:random,length:length,concat:concat,flatten:flatten,slice:slice,reverse:reverse,pad:pad,padRight:padRight,fromAscii:fromAscii,toAscii:toAscii,fromString:fromString,toString:toString,fromNumber:fromNumber,toNumber:toNumber,fromNat:fromNat,toNat:toNat,fromArray:fromArray,toArray:toArray,fromUint8Array:fromUint8Array,toUint8Array:toUint8Array}},{"./array.js":262}],264:[function(require,module,exports){// This was ported from https://github.com/emn178/js-sha3,with some minor // modifications and pruning. It is licensed under MIT:// // Copyright 2015-2016 Chen,Yi-Cyuan // // Permission is hereby granted,free of charge,to any person obtaining // a copy of this software and associated documentation files (the // "Software"),to deal in the Software without restriction,including // without limitation the rights to use,copy,modify,merge,publish,// distribute,sublicense,and/or sell copies of the Software,and to // permit persons to whom the Software is furnished to do so,subject to // the following conditions:// // The above copyright notice and this permission notice shall be // included in all copies or substantial portions of the Software. // // THE SOFTWARE IS PROVIDED "AS IS",WITHOUT WARRANTY OF ANY KIND,// EXPRESS OR IMPLIED,INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF // MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND // NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE // LIABLE FOR ANY CLAIM,DAMAGES OR OTHER LIABILITY,WHETHER IN AN ACTION // OF CONTRACT,TORT OR OTHERWISE,ARISING FROM,OUT OF OR IN CONNECTION // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. var HEX_CHARS='0123456789abcdef'.split('');var KECCAK_PADDING=[1,256,65536,16777216];var SHIFT=[0,8,16,24];var RC=[1,0,32898,0,32906,2147483648,2147516416,2147483648,32907,0,2147483649,0,2147516545,2147483648,32777,2147483648,138,0,136,0,2147516425,0,2147483658,0,2147516555,0,139,2147483648,32905,2147483648,32771,2147483648,32770,2147483648,128,2147483648,32778,0,2147483658,2147483648,2147516545,2147483648,32896,2147483648,2147483649,0,2147516424,2147483648];var Keccak=function Keccak(bits){return{blocks:[],reset:true,block:0,start:0,blockCount:1600 - (bits << 1)>>5,outputBlocks:bits>>5,s:function (s){return [].concat(s,s,s,s,s)}([0,0,0,0,0,0,0,0,0,0])}};var update=function update(state,message){var length=message.length,blocks=state.blocks,byteCount=state.blockCount << 2,blockCount=state.blockCount,outputBlocks=state.outputBlocks,s=state.s,index=0,i,code;// update while (index < length){if (state.reset){state.reset=false;blocks[0]=state.block;for (i=1;i < blockCount + 1;++i){blocks[i]=0}}if (typeof message !=="string"){for (i=state.start;index < length && i < byteCount;++index){blocks[i>>2]|=message[index] << SHIFT[i++ & 3]}}else{for (i=state.start;index < length && i < byteCount;++index){code=message.charCodeAt(index);if (code < 0x80){blocks[i>>2]|=code << SHIFT[i++ & 3]}else if (code < 0x800){blocks[i>>2]|=(0xc0 | code>>6) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | code & 0x3f) << SHIFT[i++ & 3]}else if (code < 0xd800 || code>=0xe000){blocks[i>>2]|=(0xe0 | code>>12) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | code>>6 & 0x3f) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | code & 0x3f) << SHIFT[i++ & 3]}else{code=0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);blocks[i>>2]|=(0xf0 | code>>18) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | code>>12 & 0x3f) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | code>>6 & 0x3f) << SHIFT[i++ & 3];blocks[i>>2]|=(0x80 | code & 0x3f) << SHIFT[i++ & 3]}}}state.lastByteIndex=i;if (i>=byteCount){state.start=i - byteCount;state.block=blocks[blockCount];for (i=0;i < blockCount;++i){s[i]^=blocks[i]}f(s);state.reset=true}else{state.start=i}}// finalize i=state.lastByteIndex;blocks[i>>2]|=KECCAK_PADDING[i & 3];if (state.lastByteIndex===byteCount){blocks[0]=blocks[blockCount];for (i=1;i < blockCount + 1;++i){blocks[i]=0}}blocks[blockCount - 1]|=0x80000000;for (i=0;i < blockCount;++i){s[i]^=blocks[i]}f(s);// toString var hex='',i=0,j=0,block;while (j < outputBlocks){for (i=0;i < blockCount && j < outputBlocks;++i,++j){block=s[i];hex +=HEX_CHARS[block>>4 & 0x0F] + HEX_CHARS[block & 0x0F] + HEX_CHARS[block>>12 & 0x0F] + HEX_CHARS[block>>8 & 0x0F] + HEX_CHARS[block>>20 & 0x0F] + HEX_CHARS[block>>16 & 0x0F] + HEX_CHARS[block>>28 & 0x0F] + HEX_CHARS[block>>24 & 0x0F]}if (j % blockCount===0){f(s);i=0}}return "0x" + hex};var f=function f(s){var h,l,n,c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12,b13,b14,b15,b16,b17,b18,b19,b20,b21,b22,b23,b24,b25,b26,b27,b28,b29,b30,b31,b32,b33,b34,b35,b36,b37,b38,b39,b40,b41,b42,b43,b44,b45,b46,b47,b48,b49;for (n=0;n < 48;n +=2){c0=s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];c1=s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];c2=s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];c3=s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];c4=s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];c5=s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];c6=s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];c7=s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];c8=s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];c9=s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];h=c8 ^ (c2 << 1 | c3>>>31);l=c9 ^ (c3 << 1 | c2>>>31);s[0]^=h;s[1]^=l;s[10]^=h;s[11]^=l;s[20]^=h;s[21]^=l;s[30]^=h;s[31]^=l;s[40]^=h;s[41]^=l;h=c0 ^ (c4 << 1 | c5>>>31);l=c1 ^ (c5 << 1 | c4>>>31);s[2]^=h;s[3]^=l;s[12]^=h;s[13]^=l;s[22]^=h;s[23]^=l;s[32]^=h;s[33]^=l;s[42]^=h;s[43]^=l;h=c2 ^ (c6 << 1 | c7>>>31);l=c3 ^ (c7 << 1 | c6>>>31);s[4]^=h;s[5]^=l;s[14]^=h;s[15]^=l;s[24]^=h;s[25]^=l;s[34]^=h;s[35]^=l;s[44]^=h;s[45]^=l;h=c4 ^ (c8 << 1 | c9>>>31);l=c5 ^ (c9 << 1 | c8>>>31);s[6]^=h;s[7]^=l;s[16]^=h;s[17]^=l;s[26]^=h;s[27]^=l;s[36]^=h;s[37]^=l;s[46]^=h;s[47]^=l;h=c6 ^ (c0 << 1 | c1>>>31);l=c7 ^ (c1 << 1 | c0>>>31);s[8]^=h;s[9]^=l;s[18]^=h;s[19]^=l;s[28]^=h;s[29]^=l;s[38]^=h;s[39]^=l;s[48]^=h;s[49]^=l;b0=s[0];b1=s[1];b32=s[11] << 4 | s[10]>>>28;b33=s[10] << 4 | s[11]>>>28;b14=s[20] << 3 | s[21]>>>29;b15=s[21] << 3 | s[20]>>>29;b46=s[31] << 9 | s[30]>>>23;b47=s[30] << 9 | s[31]>>>23;b28=s[40] << 18 | s[41]>>>14;b29=s[41] << 18 | s[40]>>>14;b20=s[2] << 1 | s[3]>>>31;b21=s[3] << 1 | s[2]>>>31;b2=s[13] << 12 | s[12]>>>20;b3=s[12] << 12 | s[13]>>>20;b34=s[22] << 10 | s[23]>>>22;b35=s[23] << 10 | s[22]>>>22;b16=s[33] << 13 | s[32]>>>19;b17=s[32] << 13 | s[33]>>>19;b48=s[42] << 2 | s[43]>>>30;b49=s[43] << 2 | s[42]>>>30;b40=s[5] << 30 | s[4]>>>2;b41=s[4] << 30 | s[5]>>>2;b22=s[14] << 6 | s[15]>>>26;b23=s[15] << 6 | s[14]>>>26;b4=s[25] << 11 | s[24]>>>21;b5=s[24] << 11 | s[25]>>>21;b36=s[34] << 15 | s[35]>>>17;b37=s[35] << 15 | s[34]>>>17;b18=s[45] << 29 | s[44]>>>3;b19=s[44] << 29 | s[45]>>>3;b10=s[6] << 28 | s[7]>>>4;b11=s[7] << 28 | s[6]>>>4;b42=s[17] << 23 | s[16]>>>9;b43=s[16] << 23 | s[17]>>>9;b24=s[26] << 25 | s[27]>>>7;b25=s[27] << 25 | s[26]>>>7;b6=s[36] << 21 | s[37]>>>11;b7=s[37] << 21 | s[36]>>>11;b38=s[47] << 24 | s[46]>>>8;b39=s[46] << 24 | s[47]>>>8;b30=s[8] << 27 | s[9]>>>5;b31=s[9] << 27 | s[8]>>>5;b12=s[18] << 20 | s[19]>>>12;b13=s[19] << 20 | s[18]>>>12;b44=s[29] << 7 | s[28]>>>25;b45=s[28] << 7 | s[29]>>>25;b26=s[38] << 8 | s[39]>>>24;b27=s[39] << 8 | s[38]>>>24;b8=s[48] << 14 | s[49]>>>18;b9=s[49] << 14 | s[48]>>>18;s[0]=b0 ^~b2 & b4;s[1]=b1 ^~b3 & b5;s[10]=b10 ^~b12 & b14;s[11]=b11 ^~b13 & b15;s[20]=b20 ^~b22 & b24;s[21]=b21 ^~b23 & b25;s[30]=b30 ^~b32 & b34;s[31]=b31 ^~b33 & b35;s[40]=b40 ^~b42 & b44;s[41]=b41 ^~b43 & b45;s[2]=b2 ^~b4 & b6;s[3]=b3 ^~b5 & b7;s[12]=b12 ^~b14 & b16;s[13]=b13 ^~b15 & b17;s[22]=b22 ^~b24 & b26;s[23]=b23 ^~b25 & b27;s[32]=b32 ^~b34 & b36;s[33]=b33 ^~b35 & b37;s[42]=b42 ^~b44 & b46;s[43]=b43 ^~b45 & b47;s[4]=b4 ^~b6 & b8;s[5]=b5 ^~b7 & b9;s[14]=b14 ^~b16 & b18;s[15]=b15 ^~b17 & b19;s[24]=b24 ^~b26 & b28;s[25]=b25 ^~b27 & b29;s[34]=b34 ^~b36 & b38;s[35]=b35 ^~b37 & b39;s[44]=b44 ^~b46 & b48;s[45]=b45 ^~b47 & b49;s[6]=b6 ^~b8 & b0;s[7]=b7 ^~b9 & b1;s[16]=b16 ^~b18 & b10;s[17]=b17 ^~b19 & b11;s[26]=b26 ^~b28 & b20;s[27]=b27 ^~b29 & b21;s[36]=b36 ^~b38 & b30;s[37]=b37 ^~b39 & b31;s[46]=b46 ^~b48 & b40;s[47]=b47 ^~b49 & b41;s[8]=b8 ^~b0 & b2;s[9]=b9 ^~b1 & b3;s[18]=b18 ^~b10 & b12;s[19]=b19 ^~b11 & b13;s[28]=b28 ^~b20 & b22;s[29]=b29 ^~b21 & b23;s[38]=b38 ^~b30 & b32;s[39]=b39 ^~b31 & b33;s[48]=b48 ^~b40 & b42;s[49]=b49 ^~b41 & b43;s[0]^=RC[n];s[1]^=RC[n + 1]}};var keccak=function keccak(bits){return function (str){var msg;if (str.slice(0,2)==="0x"){msg=[];for (var i=2,l=str.length;i < l;i +=2){msg.push(parseInt(str.slice(i,i + 2),16))}}else{msg=str}return update(Keccak(bits,bits),msg)}};module.exports={keccak256:keccak(256),keccak512:keccak(512),keccak256s:keccak(256),keccak512s:keccak(512)}}],265:[function(require,module,exports){arguments[4][261][0].apply(exports,arguments)},{"_process":121,"dup":261}],266:[function(require,module,exports){'use strict';var __extends=(this && this.__extends) || (function (){var extendStatics=Object.setPrototypeOf || ({__proto__:[]}instanceof Array && function (d,b){d.__proto__=b}) || function (d,b){for (var p in b) if (b.hasOwnProperty(p)) d[p]=b[p]};return function (d,b){extendStatics(d,b);function __(){this.constructor=d}d.prototype=b===null ? Object.create(b):(__.prototype=b.prototype,new __())}})();var __importStar=(this && this.__importStar) || function (mod){if (mod && mod.__esModule) return mod;;if (mod !=null) for (var k in mod) if (Object.hasOwnProperty.call(mod,k)) result[k]=mod[k];result["default"]=mod;return result};Object.defineProperty(exports,"__esModule",{value:true});// See:https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI var address_1=require("./address");var bignumber_1=require("./bignumber");var bytes_1=require("./bytes");var utf8_1=require("./utf8");var properties_1=require("./properties");var errors=__importStar(require("./errors"));var paramTypeBytes=new RegExp(/^bytes([0-9]*)$/);var paramTypeNumber=new RegExp(/^(u?int)([0-9]*)$/);var paramTypeArray=new RegExp(/^(.*)\[([0-9]*)\]$/);exports.defaultCoerceFunc=function (type,value){var match=type.match(paramTypeNumber);if (match && parseInt(match[2]) <=48){return value.toNumber()}return value};/////////////////////////////////// // Parsing for Solidity Signatures var regexParen=new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");var regexIdentifier=new RegExp("^[A-Za-z_][A-Za-z0-9_]*$");function verifyType(type){// These need to be transformed to their full description if (type.match(/^uint($|[^1-9])/)){type='uint256' + type.substring(4)}else if (type.match(/^int($|[^1-9])/)){type='int256' + type.substring(3)}return type}function parseParam(param,allowIndexed){function throwError(i){throw new Error('unexpected character "' + param[i] + '" at position ' + i + ' in "' + param + '"')}var parent={type:'',name:'',state:{allowType:true}};var node=parent;for (var i=0;i < param.length;i++){var c=param[i];switch (c){case '(':if (!node.state.allowParams){throwError(i)}node.state.allowType=false;node.type=verifyType(node.type);node.components=[{type:'',name:'',parent:node,state:{allowType:true}}];node=node.components[0];break;case ')':delete node.state;if (allowIndexed && node.name==='indexed'){node.indexed=true;node.name=''}node.type=verifyType(node.type);var child=node;node=node.parent;if (!node){throwError(i)}delete child.parent;node.state.allowParams=false;node.state.allowName=true;node.state.allowArray=true;break;case ',':delete node.state;if (allowIndexed && node.name==='indexed'){node.indexed=true;node.name=''}node.type=verifyType(node.type);var sibling={type:'',name:'',parent:node.parent,state:{allowType:true}};node.parent.components.push(sibling);delete node.parent;node=sibling;break;// Hit a space... case ' ':// If reading type,the type is done and may read a param or name if (node.state.allowType){if (node.type !==''){node.type=verifyType(node.type);delete node.state.allowType;node.state.allowName=true;node.state.allowParams=true}}// If reading name,the name is done if (node.state.allowName){if (node.name !==''){if (allowIndexed && node.name==='indexed'){node.indexed=true;node.name=''}else{node.state.allowName=false}}}break;case '[':if (!node.state.allowArray){throwError(i)}node.type +=c;node.state.allowArray=false;node.state.allowName=false;node.state.readArray=true;break;case ']':if (!node.state.readArray){throwError(i)}node.type +=c;node.state.readArray=false;node.state.allowArray=true;node.state.allowName=true;break;default:if (node.state.allowType){node.type +=c;node.state.allowParams=true;node.state.allowArray=true}else if (node.state.allowName){node.name +=c;delete node.state.allowArray}else if (node.state.readArray){node.type +=c}else{throwError(i)}}}if (node.parent){throw new Error("unexpected eof")}delete parent.state;if (allowIndexed && node.name==='indexed'){node.indexed=true;node.name=''}parent.type=verifyType(parent.type);return parent}// @TODO:Better return type function parseSignatureEvent(fragment){var abi={anonymous:false,inputs:[],name:'',type:'event'};var match=fragment.match(regexParen);if (!match){throw new Error('invalid event: ' + fragment)}abi.name=match[1].trim();splitNesting(match[2]).forEach(function (param){param=parseParam(param,true);param.indexed=!!param.indexed;abi.inputs.push(param)});match[3].split(' ').forEach(function (modifier){switch (modifier){case 'anonymous':abi.anonymous=true;break;case '':break;default:console.log('unknown modifier: ' + modifier)}});if (abi.name && !abi.name.match(regexIdentifier)){throw new Error('invalid identifier: "' + abi.name + '"')}return abi}function parseSignatureFunction(fragment){var abi={constant:false,inputs:[],name:'',outputs:[],payable:false,stateMutability:null,type:'function'};var comps=fragment.split(' returns ');var left=comps[0].match(regexParen);if (!left){throw new Error('invalid signature')}abi.name=left[1].trim();if (!abi.name.match(regexIdentifier)){throw new Error('invalid identifier: "' + left[1] + '"')}splitNesting(left[2]).forEach(function (param){abi.inputs.push(parseParam(param))});left[3].split(' ').forEach(function (modifier){switch (modifier){case 'constant':abi.constant=true;break;case 'payable':abi.payable=true;break;case 'pure':abi.constant=true;abi.stateMutability='pure';break;case 'view':abi.constant=true;abi.stateMutability='view';break;case '':break;default:console.log('unknown modifier: ' + modifier)}});// We have outputs if (comps.length>1){var right=comps[1].match(regexParen);if (right[1].trim() !='' || right[3].trim() !=''){throw new Error('unexpected tokens')}splitNesting(right[2]).forEach(function (param){abi.outputs.push(parseParam(param))})}return abi}function parseParamType(type){return parseParam(type,true)}exports.parseParamType=parseParamType;// @TODO:Allow a second boolean to expose names function formatParamType(paramType){return getParamCoder(exports.defaultCoerceFunc,paramType).type}exports.formatParamType=formatParamType;// @TODO:Allow a second boolean to expose names and modifiers function formatSignature(fragment){return fragment.name + '(' + fragment.inputs.map(function (i){return formatParamType(i)}).join(',') + ')'}exports.formatSignature=formatSignature;function parseSignature(fragment){if (typeof (fragment)==='string'){// Make sure the "returns" is surrounded by a space and all whitespace is exactly one space fragment=fragment.replace(/\(/g,' (').replace(/\)/g,') ').replace(/\s+/g,' ');fragment=fragment.trim();if (fragment.substring(0,6)==='event '){return parseSignatureEvent(fragment.substring(6).trim())}else{if (fragment.substring(0,9)==='function '){fragment=fragment.substring(9)}return parseSignatureFunction(fragment.trim())}}throw new Error('unknown signature')}exports.parseSignature=parseSignature;var Coder=(function (){function Coder(coerceFunc,name,type,localName,dynamic){this.coerceFunc=coerceFunc;this.name=name;this.type=type;this.localName=localName;this.dynamic=dynamic}return Coder}());// Clones the functionality of an existing Coder,but without a localName var CoderAnonymous=(function (_super){__extends(CoderAnonymous,_super);function CoderAnonymous(coder){var _this=_super.call(this,coder.coerceFunc,coder.name,coder.type,undefined,coder.dynamic) || this;properties_1.defineReadOnly(_this,'coder',coder);return _this}CoderAnonymous.prototype.encode=function (value){return this.coder.encode(value)};CoderAnonymous.prototype.decode=function (data,offset){return this.coder.decode(data,offset)};return CoderAnonymous}(Coder));var CoderNull=(function (_super){__extends(CoderNull,_super);function CoderNull(coerceFunc,localName){return _super.call(this,coerceFunc,'null','',localName,false) || this}CoderNull.prototype.encode=function (value){return bytes_1.arrayify([])};CoderNull.prototype.decode=function (data,offset){if (offset>data.length){throw new Error('invalid null')}return{consumed:0,value:this.coerceFunc('null',undefined)}};return CoderNull}(Coder));var CoderNumber=(function (_super){__extends(CoderNumber,_super);function CoderNumber(coerceFunc,size,signed,localName){var _this=this;var name=((signed ? 'int':'uint') + (size * 8));_this=_super.call(this,coerceFunc,name,name,localName,false) || this;_this.size=size;_this.signed=signed;return _this}CoderNumber.prototype.encode=function (value){try{var v=bignumber_1.bigNumberify(value);v=v.toTwos(this.size * 8).maskn(this.size * 8);//value=value.toTwos(size * 8).maskn(size * 8);if (this.signed){v=v.fromTwos(this.size * 8).toTwos(256)}return bytes_1.padZeros(bytes_1.arrayify(v),32)}catch (error){errors.throwError('invalid number value',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:this.name,value:value})}return null};CoderNumber.prototype.decode=function (data,offset){if (data.length < offset + 32){errors.throwError('insufficient data for ' + this.name + ' type',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:this.name,value:bytes_1.hexlify(data.slice(offset,offset + 32))})}var junkLength=32 - this.size;var value=bignumber_1.bigNumberify(data.slice(offset + junkLength,offset + 32));if (this.signed){value=value.fromTwos(this.size * 8)}else{value=value.maskn(this.size * 8)}return{consumed:32,value:this.coerceFunc(this.name,value),}};return CoderNumber}(Coder));var uint256Coder=new CoderNumber(function (type,value){return value},32,false,'none');var CoderBoolean=(function (_super){__extends(CoderBoolean,_super);function CoderBoolean(coerceFunc,localName){return _super.call(this,coerceFunc,'bool','bool',localName,false) || this}CoderBoolean.prototype.encode=function (value){return uint256Coder.encode(!!value ? 1:0)};CoderBoolean.prototype.decode=function (data,offset){try{var result=uint256Coder.decode(data,offset)}catch (error){if (error.reason==='insufficient data for uint256 type'){errors.throwError('insufficient data for boolean type',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:'boolean',value:error.value})}throw error}return{consumed:result.consumed,value:this.coerceFunc('bool',!result.value.isZero())}};return CoderBoolean}(Coder));var CoderFixedBytes=(function (_super){__extends(CoderFixedBytes,_super);function CoderFixedBytes(coerceFunc,length,localName){var _this=this;var name=('bytes' + length);_this=_super.call(this,coerceFunc,name,name,localName,false) || this;_this.length=length;return _this}CoderFixedBytes.prototype.encode=function (value){var result=new Uint8Array(32);try{var data=bytes_1.arrayify(value);if (data.length>32){throw new Error()}result.set(data)}catch (error){errors.throwError('invalid ' + this.name + ' value',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:this.name,value:(error.value || value)})}return result};CoderFixedBytes.prototype.decode=function (data,offset){if (data.length < offset + 32){errors.throwError('insufficient data for ' + name + ' type',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:this.name,value:bytes_1.hexlify(data.slice(offset,offset + 32))})}return{consumed:32,value:this.coerceFunc(this.name,bytes_1.hexlify(data.slice(offset,offset + this.length)))}};return CoderFixedBytes}(Coder));var CoderAddress=(function (_super){__extends(CoderAddress,_super);function CoderAddress(coerceFunc,localName){return _super.call(this,coerceFunc,'address','address',localName,false) || this}CoderAddress.prototype.encode=function (value){var result=new Uint8Array(32);try{result.set(bytes_1.arrayify(address_1.getAddress(value)),12)}catch (error){errors.throwError('invalid address',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:'address',value:value})}return result};CoderAddress.prototype.decode=function (data,offset){if (data.length < offset + 32){errors.throwError('insufficuent data for address type',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:'address',value:bytes_1.hexlify(data.slice(offset,offset + 32))})}return{consumed:32,value:this.coerceFunc('address',address_1.getAddress(bytes_1.hexlify(data.slice(offset + 12,offset + 32))))}};return CoderAddress}(Coder));function _encodeDynamicBytes(value){var dataLength=32 * Math.ceil(value.length / 32);var padding=new Uint8Array(dataLength - value.length);return bytes_1.concat([uint256Coder.encode(value.length),value,padding])}function _decodeDynamicBytes(data,offset,localName){if (data.length < offset + 32){errors.throwError('insufficient data for dynamicBytes length',errors.INVALID_ARGUMENT,{arg:localName,coderType:'dynamicBytes',value:bytes_1.hexlify(data.slice(offset,offset + 32))})}var length=uint256Coder.decode(data,offset).value;try{length=length.toNumber()}catch (error){errors.throwError('dynamic bytes count too large',errors.INVALID_ARGUMENT,{arg:localName,coderType:'dynamicBytes',value:length.toString()})}if (data.length < offset + 32 + length){errors.throwError('insufficient data for dynamicBytes type',errors.INVALID_ARGUMENT,{arg:localName,coderType:'dynamicBytes',value:bytes_1.hexlify(data.slice(offset,offset + 32 + length))})}return{consumed:32 + 32 * Math.ceil(length / 32),value:data.slice(offset + 32,offset + 32 + length),}}var CoderDynamicBytes=(function (_super){__extends(CoderDynamicBytes,_super);function CoderDynamicBytes(coerceFunc,localName){return _super.call(this,coerceFunc,'bytes','bytes',localName,true) || this}CoderDynamicBytes.prototype.encode=function (value){try{return _encodeDynamicBytes(bytes_1.arrayify(value))}catch (error){errors.throwError('invalid bytes value',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:'bytes',value:error.value})}return null};CoderDynamicBytes.prototype.decode=function (data,offset){var result=_decodeDynamicBytes(data,offset,this.localName);result.value=this.coerceFunc('bytes',bytes_1.hexlify(result.value));return result};return CoderDynamicBytes}(Coder));var CoderString=(function (_super){__extends(CoderString,_super);function CoderString(coerceFunc,localName){return _super.call(this,coerceFunc,'string','string',localName,true) || this}CoderString.prototype.encode=function (value){if (typeof (value) !=='string'){errors.throwError('invalid string value',errors.INVALID_ARGUMENT,{arg:this.localName,coderType:'string',value:value})}return _encodeDynamicBytes(utf8_1.toUtf8Bytes(value))};CoderString.prototype.decode=function (data,offset){var result=_decodeDynamicBytes(data,offset,this.localName);result.value=this.coerceFunc('string',utf8_1.toUtf8String(result.value));return result};return CoderString}(Coder));function alignSize(size){return 32 * Math.ceil(size / 32)}function pack(coders,values){if (Array.isArray(values)){// do nothing}else if (values && typeof (values)==='object'){var arrayValues=[];coders.forEach(function (coder){arrayValues.push(values[coder.localName])});values=arrayValues}else{errors.throwError('invalid tuple value',errors.INVALID_ARGUMENT,{coderType:'tuple',value:values})}if (coders.length !==values.length){errors.throwError('types/value length mismatch',errors.INVALID_ARGUMENT,{coderType:'tuple',value:values})}var parts=[];coders.forEach(function (coder,index){parts.push({dynamic:coder.dynamic,value:coder.encode(values[index])})});var staticSize=0,dynamicSize=0;parts.forEach(function (part){if (part.dynamic){staticSize +=32;dynamicSize +=alignSize(part.value.length)}else{staticSize +=alignSize(part.value.length)}});var offset=0,dynamicOffset=staticSize;var data=new Uint8Array(staticSize + dynamicSize);parts.forEach(function (part){if (part.dynamic){//uint256Coder.encode(dynamicOffset).copy(data,offset);data.set(uint256Coder.encode(dynamicOffset),offset);offset +=32;//part.value.copy(data,dynamicOffset);@TODO data.set(part.value,dynamicOffset);dynamicOffset +=alignSize(part.value.length)}else{//part.value.copy(data,offset);@TODO data.set(part.value,offset);offset +=alignSize(part.value.length)}});return data}function unpack(coders,data,offset){var baseOffset=offset;var consumed=0;var value=[];coders.forEach(function (coder){if (coder.dynamic){var dynamicOffset=uint256Coder.decode(data,offset);var result=coder.decode(data,baseOffset + dynamicOffset.value.toNumber());// The dynamic part is leap-frogged somewhere else;doesn't count towards size
            result.consumed = dynamicOffset.consumed;
        }
        else {
            var result = coder.decode(data, offset);
        }
        if (result.value != undefined) {
            value.push(result.value);
        }
        offset += result.consumed;
        consumed += result.consumed;
    });
    coders.forEach(function (coder, index) {
        var name = coder.localName;
        if (!name) {
            return;
        }
        if (name === 'length') {
            name = '_length';
        }
        if (value[name] != null) {
            return;
        }
        value[name] = value[index];
    });
    return {
        value: value,
        consumed: consumed
    };
}
var CoderArray = /** @class */ (function (_super) {
    __extends(CoderArray, _super);
    function CoderArray(coerceFunc, coder, length, localName) {
        var _this = this;
        var type = (coder.type + '[' + (length >= 0 ? length : '') + ']');
        var dynamic = (length === -1 || coder.dynamic);
        _this = _super.call(this, coerceFunc, 'array', type, localName, dynamic) || this;
        _this.coder = coder;
        _this.length = length;
        return _this;
    }
    CoderArray.prototype.encode = function (value) {
        if (!Array.isArray(value)) {
            errors.throwError('expected array value', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'array',
                value: value
            });
        }
        var count = this.length;
        var result = new Uint8Array(0);
        if (count === -1) {
            count = value.length;
            result = uint256Coder.encode(count);
        }
        errors.checkArgumentCount(count, value.length, 'in coder array' + (this.localName ? (" " + this.localName) : ""));
        var coders = [];
        for (var i = 0; i < value.length; i++) {
            coders.push(this.coder);
        }
        return bytes_1.concat([result, pack(coders, value)]);
    };
    CoderArray.prototype.decode = function (data, offset) {
        // @TODO:
        //if (data.length < offset + length * 32) { throw new Error('invalid array'); }
        var consumed = 0;
        var count = this.length;
        if (count === -1) {
            try {
                var decodedLength = uint256Coder.decode(data, offset);
            }
            catch (error) {
                errors.throwError('insufficient data for dynamic array length', errors.INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'array',
                    value: error.value
                });
            }
            try {
                count = decodedLength.value.toNumber();
            }
            catch (error) {
                errors.throwError('array count too large', errors.INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'array',
                    value: decodedLength.value.toString()
                });
            }
            consumed += decodedLength.consumed;
            offset += decodedLength.consumed;
        }
        var coders = [];
        for (var i = 0; i < count; i++) {
            coders.push(new CoderAnonymous(this.coder));
        }
        var result = unpack(coders, data, offset);
        result.consumed += consumed;
        result.value = this.coerceFunc(this.type, result.value);
        return result;
    };
    return CoderArray;
}(Coder));
var CoderTuple = /** @class */ (function (_super) {
    __extends(CoderTuple, _super);
    function CoderTuple(coerceFunc, coders, localName) {
        var _this = this;
        var dynamic = false;
        var types = [];
        coders.forEach(function (coder) {
            if (coder.dynamic) {
                dynamic = true;
            }
            types.push(coder.type);
        });
        var type = ('tuple(' + types.join(',') + ')');
        _this = _super.call(this, coerceFunc, 'tuple', type, localName, dynamic) || this;
        _this.coders = coders;
        return _this;
    }
    CoderTuple.prototype.encode = function (value) {
        return pack(this.coders, value);
    };
    CoderTuple.prototype.decode = function (data, offset) {
        var result = unpack(this.coders, data, offset);
        result.value = this.coerceFunc(this.type, result.value);
        return result;
    };
    return CoderTuple;
}(Coder));
/*
function getTypes(coders) {
    var type = coderTuple(coders).type;
    return type.substring(6, type.length - 1);
}
*/
function splitNesting(value) {
    var result = [];
    var accum = '';
    var depth = 0;
    for (var offset = 0; offset < value.length; offset++) {
        var c = value[offset];
        if (c === ',' && depth === 0) {
            result.push(accum);
            accum = '';
        }
        else {
            accum += c;
            if (c === '(') {
                depth++;
            }
            else if (c === ')') {
                depth--;
                if (depth === -1) {
                    throw new Error('unbalanced parenthsis');
                }
            }
        }
    }
    result.push(accum);
    return result;
}
// @TODO: Is there a way to return "class"?
var paramTypeSimple = {
    address: CoderAddress,
    bool: CoderBoolean,
    string: CoderString,
    bytes: CoderDynamicBytes,
};
function getTupleParamCoder(coerceFunc, components, localName) {
    if (!components) {
        components = [];
    }
    var coders = [];
    components.forEach(function (component) {
        coders.push(getParamCoder(coerceFunc, component));
    });
    return new CoderTuple(coerceFunc, coders, localName);
}
function getParamCoder(coerceFunc, param) {
    var coder = paramTypeSimple[param.type];
    if (coder) {
        return new coder(coerceFunc, param.name);
    }
    var match = param.type.match(paramTypeNumber);
    if (match) {
        var size = parseInt(match[2] || "256");
        if (size === 0 || size > 256 || (size % 8) !== 0) {
            errors.throwError('invalid ' + match[1] + ' bit length', errors.INVALID_ARGUMENT, {
                arg: 'param',
                value: param
            });
        }
        return new CoderNumber(coerceFunc, size / 8, (match[1] === 'int'), param.name);
    }
    var match = param.type.match(paramTypeBytes);
    if (match) {
        var size = parseInt(match[1]);
        if (size === 0 || size > 32) {
            errors.throwError('invalid bytes length', errors.INVALID_ARGUMENT, {
                arg: 'param',
                value: param
            });
        }
        return new CoderFixedBytes(coerceFunc, size, param.name);
    }
    var match = param.type.match(paramTypeArray);
    if (match) {
        var size = parseInt(match[2] || "-1");
        param = properties_1.jsonCopy(param);
        param.type = match[1];
        return new CoderArray(coerceFunc, getParamCoder(coerceFunc, param), size, param.name);
    }
    if (param.type.substring(0, 5) === 'tuple') {
        return getTupleParamCoder(coerceFunc, param.components, param.name);
    }
    if (param.type === '') {
        return new CoderNull(coerceFunc, param.name);
    }
    errors.throwError('invalid type', errors.INVALID_ARGUMENT, {
        arg: 'type',
        value: param.type
    });
    return null;
}
var AbiCoder = /** @class */ (function () {
    function AbiCoder(coerceFunc) {
        errors.checkNew(this, AbiCoder);
        if (!coerceFunc) {
            coerceFunc = exports.defaultCoerceFunc;
        }
        properties_1.defineReadOnly(this, 'coerceFunc', coerceFunc);
    }
    AbiCoder.prototype.encode = function (types, values) {
        if (types.length !== values.length) {
            errors.throwError('types/values length mismatch', errors.INVALID_ARGUMENT, {
                count: { types: types.length, values: values.length },
                value: { types: types, values: values }
            });
        }
        var coders = [];
        types.forEach(function (type) {
            // Convert types to type objects
            //   - "uint foo" => { type: "uint", name: "foo" }
            //   - "tuple(uint,uint)" => { type: "tuple", components: [ { type: "uint" }, { type: "uint" }, ] }
            var typeObject = null;
            if (typeof (type) === 'string') {
                typeObject = parseParam(type);
            }
            else {
                typeObject = type;
            }
            coders.push(getParamCoder(this.coerceFunc, typeObject));
        }, this);
        return bytes_1.hexlify(new CoderTuple(this.coerceFunc, coders, '_').encode(values));
    };
    AbiCoder.prototype.decode = function (types, data) {
        var coders = [];
        types.forEach(function (type) {
            // See encode for details
            var typeObject = null;
            if (typeof (type) === 'string') {
                typeObject = parseParam(type);
            }
            else {
                typeObject = properties_1.jsonCopy(type);
            }
            coders.push(getParamCoder(this.coerceFunc, typeObject));
        }, this);
        return new CoderTuple(this.coerceFunc, coders, '_').decode(bytes_1.arrayify(data), 0).value;
    };
    return AbiCoder;
}());
exports.AbiCoder = AbiCoder;
exports.defaultAbiCoder = new AbiCoder();

},{"./address":267,"./bignumber":268,"./bytes":269,"./errors":270,"./properties":272,"./utf8":275}],267:[function(require,module,exports){
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// We use this for base 36 maths
var bn_js_1 = __importDefault(require("bn.js"));
var bytes_1 = require("./bytes");
var keccak256_1 = require("./keccak256");
var rlp_1 = require("./rlp");
var errors = require("./errors");
function getChecksumAddress(address) {
    if (typeof (address) !== 'string' || !address.match(/^0x[0-9A-Fa-f]{40}$/)) {
        errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
    }
    address = address.toLowerCase();
    var chars = address.substring(2).split('');
    var hashed = new Uint8Array(40);
    for (var i_1 = 0; i_1 < 40; i_1++) {
        hashed[i_1] = chars[i_1].charCodeAt(0);
    }
    hashed = bytes_1.arrayify(keccak256_1.keccak256(hashed));
    for (var i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            chars[i] = chars[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
        }
    }
    return '0x' + chars.join('');
}
// Shims for environments that are missing some required constants and functions
var MAX_SAFE_INTEGER = 0x1fffffffffffff;
function log10(x) {
    if (Math.log10) {
        return Math.log10(x);
    }
    return Math.log(x) / Math.LN10;
}
// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
// Create lookup table
var ibanLookup = {};
for (var i = 0; i < 10; i++) {
    ibanLookup[String(i)] = String(i);
}
for (var i = 0; i < 26; i++) {
    ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
}
// How many decimal digits can we process? (for 64-bit float, this is 15)
var safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));
function ibanChecksum(address) {
    address = address.toUpperCase();
    address = address.substring(4) + address.substring(0, 2) + '00';
    var expanded = '';
    address.split('').forEach(function (c) {
        expanded += ibanLookup[c];
    });
    // Javascript can handle integers safely up to 15 (decimal) digits
    while (expanded.length >= safeDigits) {
        var block = expanded.substring(0, safeDigits);
        expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
    }
    var checksum = String(98 - (parseInt(expanded, 10) % 97));
    while (checksum.length < 2) {
        checksum = '0' + checksum;
    }
    return checksum;
}
;
function getAddress(address) {
    var result = null;
    if (typeof (address) !== 'string') {
        errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
    }
    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
        // Missing the 0x prefix
        if (address.substring(0, 2) !== '0x') {
            address = '0x' + address;
        }
        result = getChecksumAddress(address);
        // It is a checksummed address with a bad checksum
        if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
            errors.throwError('bad address checksum', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
        }
        // Maybe ICAP? (we only support direct mode)
    }
    else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
        // It is an ICAP address with a bad checksum
        if (address.substring(2, 4) !== ibanChecksum(address)) {
            errors.throwError('bad icap checksum', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
        }
        result = (new bn_js_1.default.BN(address.substring(4), 36)).toString(16);
        while (result.length < 40) {
            result = '0' + result;
        }
        result = getChecksumAddress('0x' + result);
    }
    else {
        errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
    }
    return result;
}
exports.getAddress = getAddress;
function getIcapAddress(address) {
    var base36 = (new bn_js_1.default.BN(getAddress(address).substring(2), 16)).toString(36).toUpperCase();
    while (base36.length < 30) {
        base36 = '0' + base36;
    }
    return 'XE' + ibanChecksum('XE00' + base36) + base36;
}
exports.getIcapAddress = getIcapAddress;
// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
function getContractAddress(transaction) {
    if (!transaction.from) {
        throw new Error('missing from address');
    }
    var nonce = transaction.nonce;
    return getAddress('0x' + keccak256_1.keccak256(rlp_1.encode([
        getAddress(transaction.from),
        bytes_1.stripZeros(bytes_1.hexlify(nonce))
    ])).substring(26));
}
exports.getContractAddress = getContractAddress;

},{"./bytes":269,"./errors":270,"./keccak256":271,"./rlp":273,"bn.js":195}],268:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */
var bn_js_1 = __importDefault(require("bn.js"));
var bytes_1 = require("./bytes");
var properties_1 = require("./properties");
var types_1 = require("./types");
var errors = __importStar(require("./errors"));
var BN_1 = new bn_js_1.default.BN(-1);
function toHex(bn) {
    var value = bn.toString(16);
    if (value[0] === '-') {
        if ((value.length % 2) === 0) {
            return '-0x0' + value.substring(1);
        }
        return "-0x" + value.substring(1);
    }
    if ((value.length % 2) === 1) {
        return '0x0' + value;
    }
    return '0x' + value;
}
function toBN(value) {
    return bigNumberify(value)._bn;
}
function toBigNumber(bn) {
    return new BigNumber(toHex(bn));
}
var BigNumber = /** @class */ (function (_super) {
    __extends(BigNumber, _super);
    function BigNumber(value) {
        var _this = _super.call(this) || this;
        errors.checkNew(_this, BigNumber);
        if (typeof (value) === 'string') {
            if (bytes_1.isHexString(value)) {
                if (value == '0x') {
                    value = '0x0';
                }
                properties_1.defineReadOnly(_this, '_hex', value);
            }
            else if (value[0] === '-' && bytes_1.isHexString(value.substring(1))) {
                properties_1.defineReadOnly(_this, '_hex', value);
            }
            else if (value.match(/^-?[0-9]*$/)) {
                if (value == '') {
                    value = '0';
                }
                properties_1.defineReadOnly(_this, '_hex', toHex(new bn_js_1.default.BN(value)));
            }
            else {
                errors.throwError('invalid BigNumber string value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
            }
        }
        else if (typeof (value) === 'number') {
            if (parseInt(String(value)) !== value) {
                errors.throwError('underflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'underflow', value: value, outputValue: parseInt(String(value)) });
            }
            try {
                properties_1.defineReadOnly(_this, '_hex', toHex(new bn_js_1.default.BN(value)));
            }
            catch (error) {
                errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
            }
        }
        else if (value instanceof BigNumber) {
            properties_1.defineReadOnly(_this, '_hex', value._hex);
        }
        else if (value.toHexString) {
            properties_1.defineReadOnly(_this, '_hex', toHex(toBN(value.toHexString())));
        }
        else if (bytes_1.isArrayish(value)) {
            properties_1.defineReadOnly(_this, '_hex', toHex(new bn_js_1.default.BN(bytes_1.hexlify(value).substring(2), 16)));
        }
        else {
            errors.throwError('invalid BigNumber value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        return _this;
    }
    Object.defineProperty(BigNumber.prototype, "_bn", {
        get: function () {
            if (this._hex[0] === '-') {
                return (new bn_js_1.default.BN(this._hex.substring(3), 16)).mul(BN_1);
            }
            return new bn_js_1.default.BN(this._hex.substring(2), 16);
        },
        enumerable: true,
        configurable: true
    });
    BigNumber.prototype.fromTwos = function (value) {
        return toBigNumber(this._bn.fromTwos(value));
    };
    BigNumber.prototype.toTwos = function (value) {
        return toBigNumber(this._bn.toTwos(value));
    };
    BigNumber.prototype.add = function (other) {
        return toBigNumber(this._bn.add(toBN(other)));
    };
    BigNumber.prototype.sub = function (other) {
        return toBigNumber(this._bn.sub(toBN(other)));
    };
    BigNumber.prototype.div = function (other) {
        var o = bigNumberify(other);
        if (o.isZero()) {
            errors.throwError('division by zero', errors.NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
        }
        return toBigNumber(this._bn.div(toBN(other)));
    };
    BigNumber.prototype.mul = function (other) {
        return toBigNumber(this._bn.mul(toBN(other)));
    };
    BigNumber.prototype.mod = function (other) {
        return toBigNumber(this._bn.mod(toBN(other)));
    };
    BigNumber.prototype.pow = function (other) {
        return toBigNumber(this._bn.pow(toBN(other)));
    };
    BigNumber.prototype.maskn = function (value) {
        return toBigNumber(this._bn.maskn(value));
    };
    BigNumber.prototype.eq = function (other) {
        return this._bn.eq(toBN(other));
    };
    BigNumber.prototype.lt = function (other) {
        return this._bn.lt(toBN(other));
    };
    BigNumber.prototype.lte = function (other) {
        return this._bn.lte(toBN(other));
    };
    BigNumber.prototype.gt = function (other) {
        return this._bn.gt(toBN(other));
    };
    BigNumber.prototype.gte = function (other) {
        return this._bn.gte(toBN(other));
    };
    BigNumber.prototype.isZero = function () {
        return this._bn.isZero();
    };
    BigNumber.prototype.toNumber = function () {
        try {
            return this._bn.toNumber();
        }
        catch (error) {
            errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
        }
        return null;
    };
    BigNumber.prototype.toString = function () {
        return this._bn.toString(10);
    };
    BigNumber.prototype.toHexString = function () {
        return this._hex;
    };
    return BigNumber;
}(types_1.BigNumber));
function bigNumberify(value) {
    if (value instanceof BigNumber) {
        return value;
    }
    return new BigNumber(value);
}
exports.bigNumberify = bigNumberify;
exports.ConstantNegativeOne = bigNumberify(-1);
exports.ConstantZero = bigNumberify(0);
exports.ConstantOne = bigNumberify(1);
exports.ConstantTwo = bigNumberify(2);
exports.ConstantWeiPerEther = bigNumberify('1000000000000000000');

},{"./bytes":269,"./errors":270,"./properties":272,"./types":274,"bn.js":195}],269:[function(require,module,exports){
"use strict";
/**
 *  Conversion Utilities
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
var errors = require("./errors");
exports.AddressZero = '0x0000000000000000000000000000000000000000';
exports.HashZero = '0x0000000000000000000000000000000000000000000000000000000000000000';
function isBigNumber(value) {
    return !!value._bn;
}
function addSlice(array) {
    if (array.slice) {
        return array;
    }
    array.slice = function () {
        var args = Array.prototype.slice.call(arguments);
        return new Uint8Array(Array.prototype.slice.apply(array, args));
    };
    return array;
}
function isArrayish(value) {
    if (!value || parseInt(String(value.length)) != value.length || typeof (value) === 'string') {
        return false;
    }
    for (var i = 0; i < value.length; i++) {
        var v = value[i];
        if (v < 0 || v >= 256 || parseInt(String(v)) != v) {
            return false;
        }
    }
    return true;
}
exports.isArrayish = isArrayish;
function arrayify(value) {
    if (value == null) {
        errors.throwError('cannot convert null value to array', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }
    if (isBigNumber(value)) {
        value = value.toHexString();
    }
    if (typeof (value) === 'string') {
        var match = value.match(/^(0x)?[0-9a-fA-F]*$/);
        if (!match) {
            errors.throwError('invalid hexidecimal string', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        if (match[1] !== '0x') {
            errors.throwError('hex string must have 0x prefix', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        value = value.substring(2);
        if (value.length % 2) {
            value = '0' + value;
        }
        var result = [];
        for (var i = 0; i < value.length; i += 2) {
            result.push(parseInt(value.substr(i, 2), 16));
        }
        return addSlice(new Uint8Array(result));
    }
    else if (typeof (value) === 'string') {
    }
    if (isArrayish(value)) {
        return addSlice(new Uint8Array(value));
    }
    errors.throwError('invalid arrayify value', null, { arg: 'value', value: value, type: typeof (value) });
    return null;
}
exports.arrayify = arrayify;
function concat(objects) {
    var arrays = [];
    var length = 0;
    for (var i = 0; i < objects.length; i++) {
        var object = arrayify(objects[i]);
        arrays.push(object);
        length += object.length;
    }
    var result = new Uint8Array(length);
    var offset = 0;
    for (var i = 0; i < arrays.length; i++) {
        result.set(arrays[i], offset);
        offset += arrays[i].length;
    }
    return addSlice(result);
}
exports.concat = concat;
function stripZeros(value) {
    var result = arrayify(value);
    if (result.length === 0) {
        return result;
    }
    // Find the first non-zero entry
    var start = 0;
    while (result[start] === 0) {
        start++;
    }
    // If we started with zeros, strip them
    if (start) {
        result = result.slice(start);
    }
    return result;
}
exports.stripZeros = stripZeros;
function padZeros(value, length) {
    value = arrayify(value);
    if (length < value.length) {
        throw new Error('cannot pad');
    }
    var result = new Uint8Array(length);
    result.set(value, length - value.length);
    return addSlice(result);
}
exports.padZeros = padZeros;
function isHexString(value, length) {
    if (typeof (value) !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) {
        return false;
    }
    return true;
}
exports.isHexString = isHexString;
var HexCharacters = '0123456789abcdef';
function hexlify(value) {
    if (isBigNumber(value)) {
        return value.toHexString();
    }
    if (typeof (value) === 'number') {
        if (value < 0) {
            errors.throwError('cannot hexlify negative value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        var hex = '';
        while (value) {
            hex = HexCharacters[value & 0x0f] + hex;
            value = Math.floor(value / 16);
        }
        if (hex.length) {
            if (hex.length % 2) {
                hex = '0' + hex;
            }
            return '0x' + hex;
        }
        return '0x00';
    }
    if (typeof (value) === 'string') {
        var match = value.match(/^(0x)?[0-9a-fA-F]*$/);
        if (!match) {
            errors.throwError('invalid hexidecimal string', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        if (match[1] !== '0x') {
            errors.throwError('hex string must have 0x prefix', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        if (value.length % 2) {
            value = '0x0' + value.substring(2);
        }
        return value;
    }
    if (isArrayish(value)) {
        var result = [];
        for (var i = 0; i < value.length; i++) {
            var v = value[i];
            result.push(HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f]);
        }
        return '0x' + result.join('');
    }
    errors.throwError('invalid hexlify value', null, { arg: 'value', value: value });
    return 'never';
}
exports.hexlify = hexlify;
function hexDataLength(data) {
    if (!isHexString(data) || (data.length % 2) !== 0) {
        return null;
    }
    return (data.length - 2) / 2;
}
exports.hexDataLength = hexDataLength;
function hexDataSlice(data, offset, length) {
    if (!isHexString(data)) {
        errors.throwError('invalid hex data', errors.INVALID_ARGUMENT, { arg: 'value', value: data });
    }
    if ((data.length % 2) !== 0) {
        errors.throwError('hex data length must be even', errors.INVALID_ARGUMENT, { arg: 'value', value: data });
    }
    offset = 2 + 2 * offset;
    if (length != null) {
        return '0x' + data.substring(offset, offset + 2 * length);
    }
    return '0x' + data.substring(offset);
}
exports.hexDataSlice = hexDataSlice;
function hexStripZeros(value) {
    if (!isHexString(value)) {
        errors.throwError('invalid hex string', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }
    while (value.length > 3 && value.substring(0, 3) === '0x0') {
        value = '0x' + value.substring(3);
    }
    return value;
}
exports.hexStripZeros = hexStripZeros;
function hexZeroPad(value, length) {
    if (!isHexString(value)) {
        errors.throwError('invalid hex string', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
    }
    while (value.length < 2 * length + 2) {
        value = '0x0' + value.substring(2);
    }
    return value;
}
exports.hexZeroPad = hexZeroPad;
function isSignature(value) {
    return (value && value.r != null && value.s != null);
}
function splitSignature(signature) {
    var v = 0;
    var r = '0x', s = '0x';
    if (isSignature(signature)) {
        if (signature.v == null && signature.recoveryParam == null) {
            errors.throwError('at least on of recoveryParam or v must be specified', errors.INVALID_ARGUMENT, { argument: 'signature', value: signature });
        }
        r = hexZeroPad(signature.r, 32);
        s = hexZeroPad(signature.s, 32);
        v = signature.v;
        if (typeof (v) === 'string') {
            v = parseInt(v, 16);
        }
        var recoveryParam = signature.recoveryParam;
        if (recoveryParam == null && signature.v != null) {
            recoveryParam = 1 - (v % 2);
        }
        v = 27 + recoveryParam;
    }
    else {
        var bytes = arrayify(signature);
        if (bytes.length !== 65) {
            throw new Error('invalid signature');
        }
        r = hexlify(bytes.slice(0, 32));
        s = hexlify(bytes.slice(32, 64));
        v = bytes[64];
        if (v !== 27 && v !== 28) {
            v = 27 + (v % 2);
        }
    }
    return {
        r: r,
        s: s,
        recoveryParam: (v - 27),
        v: v
    };
}
exports.splitSignature = splitSignature;
function joinSignature(signature) {
    signature = splitSignature(signature);
    return hexlify(concat([
        signature.r,
        signature.s,
        (signature.recoveryParam ? '0x1c' : '0x1b')
    ]));
}
exports.joinSignature = joinSignature;

},{"./errors":270}],270:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Unknown Error
exports.UNKNOWN_ERROR = 'UNKNOWN_ERROR';
// Not implemented
exports.NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';
// Missing new operator to an object
//  - name: The name of the class
exports.MISSING_NEW = 'MISSING_NEW';
// Call exception
//  - transaction: the transaction
//  - address?: the contract address
//  - args?: The arguments passed into the function
//  - method?: The Solidity method signature
//  - errorSignature?: The EIP848 error signature
//  - errorArgs?: The EIP848 error parameters
//  - reason: The reason (only for EIP848 "Error(string)")
exports.CALL_EXCEPTION = 'CALL_EXCEPTION';
// Response from a server was invalid
//   - response: The body of the response
//'BAD_RESPONSE',
// Invalid argument (e.g. value is incompatible with type) to a function:
//   - arg: The argument name that was invalid
//   - value: The value of the argument
exports.INVALID_ARGUMENT = 'INVALID_ARGUMENT';
// Missing argument to a function:
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
exports.MISSING_ARGUMENT = 'MISSING_ARGUMENT';
// Too many arguments
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
exports.UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT';
// Numeric Fault
//   - operation: the operation being executed
//   - fault: the reason this faulted
exports.NUMERIC_FAULT = 'NUMERIC_FAULT';
// Unsupported operation
//   - operation
exports.UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION';
var _permanentCensorErrors = false;
var _censorErrors = false;
// @TODO: Enum
function throwError(message, code, params) {
    if (_censorErrors) {
        throw new Error('unknown error');
    }
    if (!code) {
        code = exports.UNKNOWN_ERROR;
    }
    if (!params) {
        params = {};
    }
    var messageDetails = [];
    Object.keys(params).forEach(function (key) {
        try {
            messageDetails.push(key + '=' + JSON.stringify(params[key]));
        }
        catch (error) {
            messageDetails.push(key + '=' + JSON.stringify(params[key].toString()));
        }
    });
    var reason = message;
    if (messageDetails.length) {
        message += ' (' + messageDetails.join(',') + ')';
    }
    // @TODO: Any??
    var error = new Error(message);
    error.reason = reason;
    error.code = code;
    Object.keys(params).forEach(function (key) {
        error[key] = params[key];
    });
    throw error;
}
exports.throwError = throwError;
function checkNew(self, kind) {
    if (!(self instanceof kind)) {
        throwError('missing new', exports.MISSING_NEW, { name: kind.name });
    }
}
exports.checkNew = checkNew;
function checkArgumentCount(count, expectedCount, suffix) {
    if (!suffix) {
        suffix = '';
    }
    if (count < expectedCount) {
        throwError('missing argument' + suffix, exports.MISSING_ARGUMENT, { count: count, expectedCount: expectedCount });
    }
    if (count > expectedCount) {
        throwError('too many arguments' + suffix, exports.UNEXPECTED_ARGUMENT, { count: count, expectedCount: expectedCount });
    }
}
exports.checkArgumentCount = checkArgumentCount;
function setCensorship(censorship, permanent) {
    if (_permanentCensorErrors) {
        throwError('error censorship permanent', exports.UNSUPPORTED_OPERATION, { operation: 'setCersorship' });
    }
    _censorErrors = !!censorship;
    _permanentCensorErrors = !!permanent;
}
exports.setCensorship = setCensorship;

},{}],271:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var sha3 = require("js-sha3");
var bytes_1 = require("./bytes");
function keccak256(data) {
    return '0x' + sha3.keccak_256(bytes_1.arrayify(data));
}
exports.keccak256 = keccak256;

},{"./bytes":269,"js-sha3":265}],272:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}
exports.defineReadOnly = defineReadOnly;
function defineFrozen(object, name, value) {
    var frozen = JSON.stringify(value);
    Object.defineProperty(object, name, {
        enumerable: true,
        get: function () { return JSON.parse(frozen); }
    });
}
exports.defineFrozen = defineFrozen;
function resolveProperties(object) {
    var result = {};
    var promises = [];
    Object.keys(object).forEach(function (key) {
        var value = object[key];
        if (value instanceof Promise) {
            promises.push(value.then(function (value) {
                result[key] = value;
                return null;
            }));
        }
        else {
            result[key] = value;
        }
    });
    return Promise.all(promises).then(function () {
        return result;
    });
}
exports.resolveProperties = resolveProperties;
function shallowCopy(object) {
    var result = {};
    for (var key in object) {
        result[key] = object[key];
    }
    return result;
}
exports.shallowCopy = shallowCopy;
function jsonCopy(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.jsonCopy = jsonCopy;

},{}],273:[function(require,module,exports){
"use strict";
//See: https://github.com/ethereum/wiki/wiki/RLP
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("./bytes");
function arrayifyInteger(value) {
    var result = [];
    while (value) {
        result.unshift(value & 0xff);
        value >>= 8;
    }
    return result;
}
function unarrayifyInteger(data, offset, length) {
    var result = 0;
    for (var i = 0; i < length; i++) {
        result = (result * 256) + data[offset + i];
    }
    return result;
}
function _encode(object) {
    if (Array.isArray(object)) {
        var payload = [];
        object.forEach(function (child) {
            payload = payload.concat(_encode(child));
        });
        if (payload.length <= 55) {
            payload.unshift(0xc0 + payload.length);
            return payload;
        }
        var length = arrayifyInteger(payload.length);
        length.unshift(0xf7 + length.length);
        return length.concat(payload);
    }
    var data = Array.prototype.slice.call(bytes_1.arrayify(object));
    if (data.length === 1 && data[0] <= 0x7f) {
        return data;
    }
    else if (data.length <= 55) {
        data.unshift(0x80 + data.length);
        return data;
    }
    var length = arrayifyInteger(data.length);
    length.unshift(0xb7 + length.length);
    return length.concat(data);
}
function encode(object) {
    return bytes_1.hexlify(_encode(object));
}
exports.encode = encode;
function _decodeChildren(data, offset, childOffset, length) {
    var result = [];
    while (childOffset < offset + 1 + length) {
        var decoded = _decode(data, childOffset);
        result.push(decoded.result);
        childOffset += decoded.consumed;
        if (childOffset > offset + 1 + length) {
            throw new Error('invalid rlp');
        }
    }
    return { consumed: (1 + length), result: result };
}
// returns { consumed: number, result: Object }
function _decode(data, offset) {
    if (data.length === 0) {
        throw new Error('invalid rlp data');
    }
    // Array with extra length prefix
    if (data[offset] >= 0xf8) {
        var lengthLength = data[offset] - 0xf7;
        if (offset + 1 + lengthLength > data.length) {
            throw new Error('too short');
        }
        var length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            throw new Error('to short');
        }
        return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length);
    }
    else if (data[offset] >= 0xc0) {
        var length = data[offset] - 0xc0;
        if (offset + 1 + length > data.length) {
            throw new Error('invalid rlp data');
        }
        return _decodeChildren(data, offset, offset + 1, length);
    }
    else if (data[offset] >= 0xb8) {
        var lengthLength = data[offset] - 0xb7;
        if (offset + 1 + lengthLength > data.length) {
            throw new Error('invalid rlp data');
        }
        var length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            throw new Error('invalid rlp data');
        }
        var result = bytes_1.hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length));
        return { consumed: (1 + lengthLength + length), result: result };
    }
    else if (data[offset] >= 0x80) {
        var length = data[offset] - 0x80;
        if (offset + 1 + length > data.length) {
            throw new Error('invlaid rlp data');
        }
        var result = bytes_1.hexlify(data.slice(offset + 1, offset + 1 + length));
        return { consumed: (1 + length), result: result };
    }
    return { consumed: 1, result: bytes_1.hexlify(data[offset]) };
}
function decode(data) {
    var bytes = bytes_1.arrayify(data);
    var decoded = _decode(bytes, 0);
    if (decoded.consumed !== bytes.length) {
        throw new Error('invalid rlp data');
    }
    return decoded.result;
}
exports.decode = decode;

},{"./bytes":269}],274:[function(require,module,exports){
"use strict";
///////////////////////////////
// Bytes
Object.defineProperty(exports, "__esModule", { value: true });
///////////////////////////////
// BigNumber
var BigNumber = /** @class */ (function () {
    function BigNumber() {
    }
    return BigNumber;
}());
exports.BigNumber = BigNumber;
;
;
;
///////////////////////////////
// Interface
var Indexed = /** @class */ (function () {
    function Indexed() {
    }
    return Indexed;
}());
exports.Indexed = Indexed;
/**
 *  Provider
 *
 *  Note: We use an abstract class so we can use instanceof to determine if an
 *        object is a Provider.
 */
var MinimalProvider = /** @class */ (function () {
    function MinimalProvider() {
    }
    return MinimalProvider;
}());
exports.MinimalProvider = MinimalProvider;
/**
 *  Signer
 *
 *  Note: We use an abstract class so we can use instanceof to determine if an
 *        object is a Signer.
 */
var Signer = /** @class */ (function () {
    function Signer() {
    }
    return Signer;
}());
exports.Signer = Signer;
///////////////////////////////
// HDNode
var HDNode = /** @class */ (function () {
    function HDNode() {
    }
    return HDNode;
}());
exports.HDNode = HDNode;

},{}],275:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("./bytes");
var UnicodeNormalizationForm;
(function (UnicodeNormalizationForm) {
    UnicodeNormalizationForm["current"] = "";
    UnicodeNormalizationForm["NFC"] = "NFC";
    UnicodeNormalizationForm["NFD"] = "NFD";
    UnicodeNormalizationForm["NFKC"] = "NFKC";
    UnicodeNormalizationForm["NFKD"] = "NFKD";
})(UnicodeNormalizationForm = exports.UnicodeNormalizationForm || (exports.UnicodeNormalizationForm = {}));
;
// http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
function toUtf8Bytes(str, form) {
    if (form === void 0) { form = UnicodeNormalizationForm.current; }
    if (form != UnicodeNormalizationForm.current) {
        str = str.normalize(form);
    }
    var result = [];
    var offset = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            result[offset++] = c;
        }
        else if (c < 2048) {
            result[offset++] = (c >> 6) | 192;
            result[offset++] = (c & 63) | 128;
        }
        else if (((c & 0xFC00) == 0xD800) && (i + 1) < str.length && ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
            result[offset++] = (c >> 18) | 240;
            result[offset++] = ((c >> 12) & 63) | 128;
            result[offset++] = ((c >> 6) & 63) | 128;
            result[offset++] = (c & 63) | 128;
        }
        else {
            result[offset++] = (c >> 12) | 224;
            result[offset++] = ((c >> 6) & 63) | 128;
            result[offset++] = (c & 63) | 128;
        }
    }
    return bytes_1.arrayify(result);
}
exports.toUtf8Bytes = toUtf8Bytes;
;
// http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499
function toUtf8String(bytes) {
    bytes = bytes_1.arrayify(bytes);
    var result = '';
    var i = 0;
    // Invalid bytes are ignored
    while (i < bytes.length) {
        var c = bytes[i++];
        if (c >> 7 == 0) {
            // 0xxx xxxx
            result += String.fromCharCode(c);
            continue;
        }
        // Invalid starting byte
        if (c >> 6 == 0x02) {
            continue;
        }
        // Multibyte; how many bytes left for thus character?
        var extraLength = null;
        if (c >> 5 == 0x06) {
            extraLength = 1;
        }
        else if (c >> 4 == 0x0e) {
            extraLength = 2;
        }
        else if (c >> 3 == 0x1e) {
            extraLength = 3;
        }
        else if (c >> 2 == 0x3e) {
            extraLength = 4;
        }
        else if (c >> 1 == 0x7e) {
            extraLength = 5;
        }
        else {
            continue;
        }
        // Do we have enough bytes in our data?
        if (i + extraLength > bytes.length) {
            // If there is an invalid unprocessed byte, try to continue
            for (; i < bytes.length; i++) {
                if (bytes[i] >> 6 != 0x02) {
                    break;
                }
            }
            if (i != bytes.length)
                continue;
            // All leftover bytes are valid.
            return result;
        }
        // Remove the UTF-8 prefix from the char (res)
        var res = c & ((1 << (8 - extraLength - 1)) - 1);
        var count;
        for (count = 0; count < extraLength; count++) {
            var nextChar = bytes[i++];
            // Is the char valid multibyte part?
            if (nextChar >> 6 != 0x02) {
                break;
            }
            ;
            res = (res << 6) | (nextChar & 0x3f);
        }
        if (count != extraLength) {
            i--;
            continue;
        }
        if (res <= 0xffff) {
            result += String.fromCharCode(res);
            continue;
        }
        res -= 0x10000;
        result += String.fromCharCode(((res >> 10) & 0x3ff) + 0xd800, (res & 0x3ff) + 0xdc00);
    }
    return result;
}
exports.toUtf8String = toUtf8String;

},{"./bytes":269}],276:[function(require,module,exports){
'use strict';

var BN = require('bn.js');
var numberToBN = require('number-to-bn');

var zero = new BN(0);
var negative1 = new BN(-1);

// complete ethereum unit map
var unitMap = {
  'noether': '0', // eslint-disable-line
  'wei': '1', // eslint-disable-line
  'kwei': '1000', // eslint-disable-line
  'Kwei': '1000', // eslint-disable-line
  'babbage': '1000', // eslint-disable-line
  'femtoether': '1000', // eslint-disable-line
  'mwei': '1000000', // eslint-disable-line
  'Mwei': '1000000', // eslint-disable-line
  'lovelace': '1000000', // eslint-disable-line
  'picoether': '1000000', // eslint-disable-line
  'gwei': '1000000000', // eslint-disable-line
  'Gwei': '1000000000', // eslint-disable-line
  'shannon': '1000000000', // eslint-disable-line
  'nanoether': '1000000000', // eslint-disable-line
  'nano': '1000000000', // eslint-disable-line
  'szabo': '1000000000000', // eslint-disable-line
  'microether': '1000000000000', // eslint-disable-line
  'micro': '1000000000000', // eslint-disable-line
  'finney': '1000000000000000', // eslint-disable-line
  'milliether': '1000000000000000', // eslint-disable-line
  'milli': '1000000000000000', // eslint-disable-line
  'ether': '1000000000000000000', // eslint-disable-line
  'kether': '1000000000000000000000', // eslint-disable-line
  'grand': '1000000000000000000000', // eslint-disable-line
  'mether': '1000000000000000000000000', // eslint-disable-line
  'gether': '1000000000000000000000000000', // eslint-disable-line
  'tether': '1000000000000000000000000000000' };

/**
 * Returns value of unit in Wei
 *
 * @method getValueOfUnit
 * @param {String} unit the unit to convert to, default ether
 * @returns {BigNumber} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
function getValueOfUnit(unitInput) {
  var unit = unitInput ? unitInput.toLowerCase() : 'ether';
  var unitValue = unitMap[unit]; // eslint-disable-line

  if (typeof unitValue !== 'string') {
    throw new Error('[ethjs-unit] the unit provided ' + unitInput + ' doesn\'t exists, please use the one of the following units ' + JSON.stringify(unitMap,null,2))}return new BN(unitValue,10)}function numberToString(arg){if (typeof arg==='string'){if (!arg.match(/^-?[0-9.]+$/)){throw new Error('while converting number to string, invalid number value \'' + arg + '\', should be a number matching (^-?[0-9.]+).')}return arg}else if (typeof arg==='number'){return String(arg)}else if (typeof arg==='object' && arg.toString && (arg.toTwos || arg.dividedToIntegerBy)){if (arg.toPrecision){return String(arg.toPrecision())}else{// eslint-disable-line return arg.toString(10)}}throw new Error('while converting number to string, invalid number value \'' + arg + '\' type ' + typeof arg + '.')}function fromWei(weiInput,unit,optionsInput){var wei=numberToBN(weiInput);// eslint-disable-line var negative=wei.lt(zero);// eslint-disable-line var base=getValueOfUnit(unit);var baseLength=unitMap[unit].length - 1 || 1;;if (negative){wei=wei.mul(negative1)}var fraction=wei.mod(base).toString(10);// eslint-disable-line while (fraction.length < baseLength){fraction='0' + fraction}if (!options.pad){fraction=fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1]}var whole=wei.div(base).toString(10);// eslint-disable-line if (options.commify){whole=whole.replace(/\B(?=(\d{3})+(?!\d))/g,',')}var value='' + whole + (fraction=='0' ? '' :'.' + fraction);// eslint-disable-line if (negative){value='-' + value}return value}function toWei(etherInput,unit){var ether=numberToString(etherInput);// eslint-disable-line var base=getValueOfUnit(unit);var baseLength=unitMap[unit].length - 1 || 1;// Is it negative? var negative=ether.substring(0,1)==='-';// eslint-disable-line if (negative){ether=ether.substring(1)}if (ether==='.'){throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei, invalid value')}// Split it into a whole and fractional part var comps=ether.split('.');// eslint-disable-line if (comps.length>2){throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei,  too many decimal points')}var whole=comps[0],fraction=comps[1];// eslint-disable-line if (!whole){whole='0'}if (!fraction){fraction='0'}if (fraction.length>baseLength){throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei, too many decimal places')}while (fraction.length < baseLength){fraction +='0'}whole=new BN(whole);fraction=new BN(fraction);var wei=whole.mul(base).add(fraction);// eslint-disable-line if (negative){wei=wei.mul(negative1)}return new BN(wei.toString(10),10)}module.exports={unitMap:unitMap,numberToString:numberToString,getValueOfUnit:getValueOfUnit,fromWei:fromWei,toWei:toWei}},{"bn.js":277,"number-to-bn":307}],277:[function(require,module,exports){(function (module,exports){'use strict';// Utils function assert (val,msg){if (!val) throw new Error(msg || 'Assertion failed')}// Could use `inherits` module,but don't want to move from single file
  // architecture yet.
  function inherits (ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  }

  // BN

  function BN (number, base, endian) {
    if (BN.isBN(number)) {
      return number;
    }

    this.negative = 0;
    this.words = null;
    this.length = 0;

    // Reduction context
    this.red = null;

    if (number !== null) {
      if (base === 'le' || base === 'be') {
        endian = base;
        base = 10;
      }

      this._init(number || 0, base || 10, endian || 'be');
    }
  }
  if (typeof module === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  BN.BN = BN;
  BN.wordSize = 26;

  var Buffer;
  try {
    Buffer = require('buf' + 'fer').Buffer;
  } catch (e) {
  }

  BN.isBN = function isBN (num) {
    if (num instanceof BN) {
      return true;
    }

    return num !== null && typeof num === 'object' &&
      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
  };

  BN.max = function max (left, right) {
    if (left.cmp(right) > 0) return left;
    return right;
  };

  BN.min = function min (left, right) {
    if (left.cmp(right) < 0) return left;
    return right;
  };

  BN.prototype._init = function init (number, base, endian) {
    if (typeof number === 'number') {
      return this._initNumber(number, base, endian);
    }

    if (typeof number === 'object') {
      return this._initArray(number, base, endian);
    }

    if (base === 'hex') {
      base = 16;
    }
    assert(base === (base | 0) && base >= 2 && base <= 36);

    number = number.toString().replace(/\s+/g, '');
    var start = 0;
    if (number[0] === '-') {
      start++;
    }

    if (base === 16) {
      this._parseHex(number, start);
    } else {
      this._parseBase(number, base, start);
    }

    if (number[0] === '-') {
      this.negative = 1;
    }

    this.strip();

    if (endian !== 'le') return;

    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initNumber = function _initNumber (number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [ number & 0x3ffffff ];
      this.length = 1;
    } else if (number < 0x10000000000000) {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff,
        1
      ];
      this.length = 3;
    }

    if (endian !== 'le') return;

    // Reverse the bytes
    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initArray = function _initArray (number, base, endian) {
    // Perhaps a Uint8Array
    assert(typeof number.length === 'number');
    if (number.length <= 0) {
      this.words = [ 0 ];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    var off = 0;
    if (endian === 'be') {
      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    } else if (endian === 'le') {
      for (i = 0, j = 0; i < number.length; i += 3) {
        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    }
    return this.strip();
  };

  function parseHex (str, start, end) {
    var r = 0;
    var len = Math.min(str.length, end);
    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;

      r <<= 4;

      // 'a' - 'f'
      if (c >= 49 && c <= 54) {
        r |= c - 49 + 0xa;

      // 'A' - 'F'
      } else if (c >= 17 && c <= 22) {
        r |= c - 17 + 0xa;

      // '0' - '9'
      } else {
        r |= c & 0xf;
      }
    }
    return r;
  }

  BN.prototype._parseHex = function _parseHex (number, start) {
    // Create possibly bigger array to ensure that it fits the number
    this.length = Math.ceil((number.length - start) / 6);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    // Scan 24-bit chunks and add them to the number
    var off = 0;
    for (i = number.length - 6, j = 0; i >= start; i -= 6) {
      w = parseHex(number, i, i + 6);
      this.words[j] |= (w << off) & 0x3ffffff;
      // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb
      this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
    if (i + 6 !== start) {
      w = parseHex(number, start, i + 6);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    }
    this.strip();
  };

  function parseBase (str, start, end, mul) {
    var r = 0;
    var len = Math.min(str.length, end);
    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;

      r *= mul;

      // 'a'
      if (c >= 49) {
        r += c - 49 + 0xa;

      // 'A'
      } else if (c >= 17) {
        r += c - 17 + 0xa;

      // '0' - '9'
      } else {
        r += c;
      }
    }
    return r;
  }

  BN.prototype._parseBase = function _parseBase (number, base, start) {
    // Initialize as zero
    this.words = [ 0 ];
    this.length = 1;

    // Find length of limb in base
    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
      limbLen++;
    }
    limbLen--;
    limbPow = (limbPow / base) | 0;

    var total = number.length - start;
    var mod = total % limbLen;
    var end = Math.min(total, total - mod) + start;

    var word = 0;
    for (var i = start; i < end; i += limbLen) {
      word = parseBase(number, i, i + limbLen, base);

      this.imuln(limbPow);
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }

    if (mod !== 0) {
      var pow = 1;
      word = parseBase(number, i, number.length, base);

      for (i = 0; i < mod; i++) {
        pow *= base;
      }

      this.imuln(pow);
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }
  };

  BN.prototype.copy = function copy (dest) {
    dest.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      dest.words[i] = this.words[i];
    }
    dest.length = this.length;
    dest.negative = this.negative;
    dest.red = this.red;
  };

  BN.prototype.clone = function clone () {
    var r = new BN(null);
    this.copy(r);
    return r;
  };

  BN.prototype._expand = function _expand (size) {
    while (this.length < size) {
      this.words[this.length++] = 0;
    }
    return this;
  };

  // Remove leading `0` from `this`
  BN.prototype.strip = function strip () {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--;
    }
    return this._normSign();
  };

  BN.prototype._normSign = function _normSign () {
    // -0 = 0
    if (this.length === 1 && this.words[0] === 0) {
      this.negative = 0;
    }
    return this;
  };

  BN.prototype.inspect = function inspect () {
    return (this.red ? '<BN-R:' : '<BN:') + this.toString(16) + '>';
  };

  /*

  var zeros = [];
  var groupSizes = [];
  var groupBases = [];

  var s = '';
  var i = -1;
  while (++i < BN.wordSize) {
    zeros[i] = s;
    s += '0';
  }
  groupSizes[0] = 0;
  groupSizes[1] = 0;
  groupBases[0] = 0;
  groupBases[1] = 0;
  var base = 2 - 1;
  while (++base < 36 + 1) {
    var groupSize = 0;
    var groupBase = 1;
    while (groupBase < (1 << BN.wordSize) / base) {
      groupBase *= base;
      groupSize += 1;
    }
    groupSizes[base] = groupSize;
    groupBases[base] = groupBase;
  }

  */

  var zeros = [
    '',
    '0',
    '00',
    '000',
    '0000',
    '00000',
    '000000',
    '0000000',
    '00000000',
    '000000000',
    '0000000000',
    '00000000000',
    '000000000000',
    '0000000000000',
    '00000000000000',
    '000000000000000',
    '0000000000000000',
    '00000000000000000',
    '000000000000000000',
    '0000000000000000000',
    '00000000000000000000',
    '000000000000000000000',
    '0000000000000000000000',
    '00000000000000000000000',
    '000000000000000000000000',
    '0000000000000000000000000'
  ];

  var groupSizes = [
    0, 0,
    25, 16, 12, 11, 10, 9, 8,
    8, 7, 7, 7, 7, 6, 6,
    6, 6, 6, 6, 6, 5, 5,
    5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5
  ];

  var groupBases = [
    0, 0,
    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
  ];

  BN.prototype.toString = function toString (base, padding) {
    base = base || 10;
    padding = padding | 0 || 1;

    var out;
    if (base === 16 || base === 'hex') {
      out = '';
      var off = 0;
      var carry = 0;
      for (var i = 0; i < this.length; i++) {
        var w = this.words[i];
        var word = (((w << off) | carry) & 0xffffff).toString(16);
        carry = (w >>> (24 - off)) & 0xffffff;
        if (carry !== 0 || i !== this.length - 1) {
          out = zeros[6 - word.length] + word + out;
        } else {
          out = word + out;
        }
        off += 2;
        if (off >= 26) {
          off -= 26;
          i--;
        }
      }
      if (carry !== 0) {
        out = carry.toString(16) + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    if (base === (base | 0) && base >= 2 && base <= 36) {
      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
      var groupSize = groupSizes[base];
      // var groupBase = Math.pow(base, groupSize);
      var groupBase = groupBases[base];
      out = '';
      var c = this.clone();
      c.negative = 0;
      while (!c.isZero()) {
        var r = c.modn(groupBase).toString(base);
        c = c.idivn(groupBase);

        if (!c.isZero()) {
          out = zeros[groupSize - r.length] + r + out;
        } else {
          out = r + out;
        }
      }
      if (this.isZero()) {
        out = '0' + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    assert(false, 'Base should be between 2 and 36');
  };

  BN.prototype.toNumber = function toNumber () {
    var ret = this.words[0];
    if (this.length === 2) {
      ret += this.words[1] * 0x4000000;
    } else if (this.length === 3 && this.words[2] === 0x01) {
      // NOTE: at this stage it is known that the top bit is set
      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
    } else if (this.length > 2) {
      assert(false, 'Number can only safely store up to 53 bits');
    }
    return (this.negative !== 0) ? -ret : ret;
  };

  BN.prototype.toJSON = function toJSON () {
    return this.toString(16);
  };

  BN.prototype.toBuffer = function toBuffer (endian, length) {
    assert(typeof Buffer !== 'undefined');
    return this.toArrayLike(Buffer, endian, length);
  };

  BN.prototype.toArray = function toArray (endian, length) {
    return this.toArrayLike(Array, endian, length);
  };

  BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
    var byteLength = this.byteLength();
    var reqLength = length || Math.max(1, byteLength);
    assert(byteLength <= reqLength, 'byte array longer than desired length');
    assert(reqLength > 0, 'Requested array length <=0');

    this.strip();
    var littleEndian = endian === 'le';
    var res = new ArrayType(reqLength);

    var b, i;
    var q = this.clone();
    if (!littleEndian) {
      // Assume big-endian
      for (i = 0; i < reqLength - byteLength; i++) {
        res[i] = 0;
      }

      for (i = 0; !q.isZero(); i++) {
        b = q.andln(0xff);
        q.iushrn(8);

        res[reqLength - i - 1] = b;
      }
    } else {
      for (i = 0; !q.isZero(); i++) {
        b = q.andln(0xff);
        q.iushrn(8);

        res[i] = b;
      }

      for (; i < reqLength; i++) {
        res[i] = 0;
      }
    }

    return res;
  };

  if (Math.clz32) {
    BN.prototype._countBits = function _countBits (w) {
      return 32 - Math.clz32(w);
    };
  } else {
    BN.prototype._countBits = function _countBits (w) {
      var t = w;
      var r = 0;
      if (t >= 0x1000) {
        r += 13;
        t >>>= 13;
      }
      if (t >= 0x40) {
        r += 7;
        t >>>= 7;
      }
      if (t >= 0x8) {
        r += 4;
        t >>>= 4;
      }
      if (t >= 0x02) {
        r += 2;
        t >>>= 2;
      }
      return r + t;
    };
  }

  BN.prototype._zeroBits = function _zeroBits (w) {
    // Short-cut
    if (w === 0) return 26;

    var t = w;
    var r = 0;
    if ((t & 0x1fff) === 0) {
      r += 13;
      t >>>= 13;
    }
    if ((t & 0x7f) === 0) {
      r += 7;
      t >>>= 7;
    }
    if ((t & 0xf) === 0) {
      r += 4;
      t >>>= 4;
    }
    if ((t & 0x3) === 0) {
      r += 2;
      t >>>= 2;
    }
    if ((t & 0x1) === 0) {
      r++;
    }
    return r;
  };

  // Return number of used bits in a BN
  BN.prototype.bitLength = function bitLength () {
    var w = this.words[this.length - 1];
    var hi = this._countBits(w);
    return (this.length - 1) * 26 + hi;
  };

  function toBitArray (num) {
    var w = new Array(num.bitLength());

    for (var bit = 0; bit < w.length; bit++) {
      var off = (bit / 26) | 0;
      var wbit = bit % 26;

      w[bit] = (num.words[off] & (1 << wbit)) >>> wbit;
    }

    return w;
  }

  // Number of trailing zero bits
  BN.prototype.zeroBits = function zeroBits () {
    if (this.isZero()) return 0;

    var r = 0;
    for (var i = 0; i < this.length; i++) {
      var b = this._zeroBits(this.words[i]);
      r += b;
      if (b !== 26) break;
    }
    return r;
  };

  BN.prototype.byteLength = function byteLength () {
    return Math.ceil(this.bitLength() / 8);
  };

  BN.prototype.toTwos = function toTwos (width) {
    if (this.negative !== 0) {
      return this.abs().inotn(width).iaddn(1);
    }
    return this.clone();
  };

  BN.prototype.fromTwos = function fromTwos (width) {
    if (this.testn(width - 1)) {
      return this.notn(width).iaddn(1).ineg();
    }
    return this.clone();
  };

  BN.prototype.isNeg = function isNeg () {
    return this.negative !== 0;
  };

  // Return negative clone of `this`
  BN.prototype.neg = function neg () {
    return this.clone().ineg();
  };

  BN.prototype.ineg = function ineg () {
    if (!this.isZero()) {
      this.negative ^= 1;
    }

    return this;
  };

  // Or `num` with `this` in-place
  BN.prototype.iuor = function iuor (num) {
    while (this.length < num.length) {
      this.words[this.length++] = 0;
    }

    for (var i = 0; i < num.length; i++) {
      this.words[i] = this.words[i] | num.words[i];
    }

    return this.strip();
  };

  BN.prototype.ior = function ior (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuor(num);
  };

  // Or `num` with `this`
  BN.prototype.or = function or (num) {
    if (this.length > num.length) return this.clone().ior(num);
    return num.clone().ior(this);
  };

  BN.prototype.uor = function uor (num) {
    if (this.length > num.length) return this.clone().iuor(num);
    return num.clone().iuor(this);
  };

  // And `num` with `this` in-place
  BN.prototype.iuand = function iuand (num) {
    // b = min-length(num, this)
    var b;
    if (this.length > num.length) {
      b = num;
    } else {
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = this.words[i] & num.words[i];
    }

    this.length = b.length;

    return this.strip();
  };

  BN.prototype.iand = function iand (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuand(num);
  };

  // And `num` with `this`
  BN.prototype.and = function and (num) {
    if (this.length > num.length) return this.clone().iand(num);
    return num.clone().iand(this);
  };

  BN.prototype.uand = function uand (num) {
    if (this.length > num.length) return this.clone().iuand(num);
    return num.clone().iuand(this);
  };

  // Xor `num` with `this` in-place
  BN.prototype.iuxor = function iuxor (num) {
    // a.length > b.length
    var a;
    var b;
    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = a.words[i] ^ b.words[i];
    }

    if (this !== a) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = a.length;

    return this.strip();
  };

  BN.prototype.ixor = function ixor (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuxor(num);
  };

  // Xor `num` with `this`
  BN.prototype.xor = function xor (num) {
    if (this.length > num.length) return this.clone().ixor(num);
    return num.clone().ixor(this);
  };

  BN.prototype.uxor = function uxor (num) {
    if (this.length > num.length) return this.clone().iuxor(num);
    return num.clone().iuxor(this);
  };

  // Not ``this`` with ``width`` bitwidth
  BN.prototype.inotn = function inotn (width) {
    assert(typeof width === 'number' && width >= 0);

    var bytesNeeded = Math.ceil(width / 26) | 0;
    var bitsLeft = width % 26;

    // Extend the buffer with leading zeroes
    this._expand(bytesNeeded);

    if (bitsLeft > 0) {
      bytesNeeded--;
    }

    // Handle complete words
    for (var i = 0; i < bytesNeeded; i++) {
      this.words[i] = ~this.words[i] & 0x3ffffff;
    }

    // Handle the residue
    if (bitsLeft > 0) {
      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
    }

    // And remove leading zeroes
    return this.strip();
  };

  BN.prototype.notn = function notn (width) {
    return this.clone().inotn(width);
  };

  // Set `bit` of `this`
  BN.prototype.setn = function setn (bit, val) {
    assert(typeof bit === 'number' && bit >= 0);

    var off = (bit / 26) | 0;
    var wbit = bit % 26;

    this._expand(off + 1);

    if (val) {
      this.words[off] = this.words[off] | (1 << wbit);
    } else {
      this.words[off] = this.words[off] & ~(1 << wbit);
    }

    return this.strip();
  };

  // Add `num` to `this` in-place
  BN.prototype.iadd = function iadd (num) {
    var r;

    // negative + positive
    if (this.negative !== 0 && num.negative === 0) {
      this.negative = 0;
      r = this.isub(num);
      this.negative ^= 1;
      return this._normSign();

    // positive + negative
    } else if (this.negative === 0 && num.negative !== 0) {
      num.negative = 0;
      r = this.isub(num);
      num.negative = 1;
      return r._normSign();
    }

    // a.length > b.length
    var a, b;
    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;
    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    this.length = a.length;
    if (carry !== 0) {
      this.words[this.length] = carry;
      this.length++;
    // Copy the rest of the words
    } else if (a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    return this;
  };

  // Add `num` to `this`
  BN.prototype.add = function add (num) {
    var res;
    if (num.negative !== 0 && this.negative === 0) {
      num.negative = 0;
      res = this.sub(num);
      num.negative ^= 1;
      return res;
    } else if (num.negative === 0 && this.negative !== 0) {
      this.negative = 0;
      res = num.sub(this);
      this.negative = 1;
      return res;
    }

    if (this.length > num.length) return this.clone().iadd(num);

    return num.clone().iadd(this);
  };

  // Subtract `num` from `this` in-place
  BN.prototype.isub = function isub (num) {
    // this - (-num) = this + num
    if (num.negative !== 0) {
      num.negative = 0;
      var r = this.iadd(num);
      num.negative = 1;
      return r._normSign();

    // -this - num = -(this + num)
    } else if (this.negative !== 0) {
      this.negative = 0;
      this.iadd(num);
      this.negative = 1;
      return this._normSign();
    }

    // At this point both numbers are positive
    var cmp = this.cmp(num);

    // Optimization - zeroify
    if (cmp === 0) {
      this.negative = 0;
      this.length = 1;
      this.words[0] = 0;
      return this;
    }

    // a > b
    var a, b;
    if (cmp > 0) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;
    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }

    // Copy rest of the words
    if (carry === 0 && i < a.length && a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = Math.max(this.length, i);

    if (a !== this) {
      this.negative = 1;
    }

    return this.strip();
  };

  // Subtract `num` from `this`
  BN.prototype.sub = function sub (num) {
    return this.clone().isub(num);
  };

  function smallMulTo (self, num, out) {
    out.negative = num.negative ^ self.negative;
    var len = (self.length + num.length) | 0;
    out.length = len;
    len = (len - 1) | 0;

    // Peel one iteration (compiler can't do it,because of code complexity) var a=self.words[0] | 0;var b=num.words[0] | 0;var r=a * b;var lo=r & 0x3ffffff;var carry=(r / 0x4000000) | 0;out.words[0]=lo;for (var k=1;k < len;k++){// Sum all words with the same `i + j=k` and accumulate `ncarry`,// note that ncarry could be>=0x3ffffff var ncarry=carry>>>26;var rword=carry & 0x3ffffff;var maxJ=Math.min(k,num.length - 1);for (var j=Math.max(0,k - self.length + 1);j <=maxJ;j++){var i=(k - j) | 0;a=self.words[i] | 0;b=num.words[j] | 0;r=a * b + rword;ncarry +=(r / 0x4000000) | 0;rword=r & 0x3ffffff}out.words[k]=rword | 0;carry=ncarry | 0}if (carry !==0){out.words[k]=carry | 0}else{out.length--}return out.strip()}// TODO(indutny):it may be reasonable to omit it for users who don't need
  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
  // multiplication (like elliptic secp256k1).
  var comb10MulTo = function comb10MulTo (self, num, out) {
    var a = self.words;
    var b = num.words;
    var o = out.words;
    var c = 0;
    var lo;
    var mid;
    var hi;
    var a0 = a[0] | 0;
    var al0 = a0 & 0x1fff;
    var ah0 = a0 >>> 13;
    var a1 = a[1] | 0;
    var al1 = a1 & 0x1fff;
    var ah1 = a1 >>> 13;
    var a2 = a[2] | 0;
    var al2 = a2 & 0x1fff;
    var ah2 = a2 >>> 13;
    var a3 = a[3] | 0;
    var al3 = a3 & 0x1fff;
    var ah3 = a3 >>> 13;
    var a4 = a[4] | 0;
    var al4 = a4 & 0x1fff;
    var ah4 = a4 >>> 13;
    var a5 = a[5] | 0;
    var al5 = a5 & 0x1fff;
    var ah5 = a5 >>> 13;
    var a6 = a[6] | 0;
    var al6 = a6 & 0x1fff;
    var ah6 = a6 >>> 13;
    var a7 = a[7] | 0;
    var al7 = a7 & 0x1fff;
    var ah7 = a7 >>> 13;
    var a8 = a[8] | 0;
    var al8 = a8 & 0x1fff;
    var ah8 = a8 >>> 13;
    var a9 = a[9] | 0;
    var al9 = a9 & 0x1fff;
    var ah9 = a9 >>> 13;
    var b0 = b[0] | 0;
    var bl0 = b0 & 0x1fff;
    var bh0 = b0 >>> 13;
    var b1 = b[1] | 0;
    var bl1 = b1 & 0x1fff;
    var bh1 = b1 >>> 13;
    var b2 = b[2] | 0;
    var bl2 = b2 & 0x1fff;
    var bh2 = b2 >>> 13;
    var b3 = b[3] | 0;
    var bl3 = b3 & 0x1fff;
    var bh3 = b3 >>> 13;
    var b4 = b[4] | 0;
    var bl4 = b4 & 0x1fff;
    var bh4 = b4 >>> 13;
    var b5 = b[5] | 0;
    var bl5 = b5 & 0x1fff;
    var bh5 = b5 >>> 13;
    var b6 = b[6] | 0;
    var bl6 = b6 & 0x1fff;
    var bh6 = b6 >>> 13;
    var b7 = b[7] | 0;
    var bl7 = b7 & 0x1fff;
    var bh7 = b7 >>> 13;
    var b8 = b[8] | 0;
    var bl8 = b8 & 0x1fff;
    var bh8 = b8 >>> 13;
    var b9 = b[9] | 0;
    var bl9 = b9 & 0x1fff;
    var bh9 = b9 >>> 13;

    out.negative = self.negative ^ num.negative;
    out.length = 19;
    /* k = 0 */
    lo = Math.imul(al0, bl0);
    mid = Math.imul(al0, bh0);
    mid = (mid + Math.imul(ah0, bl0)) | 0;
    hi = Math.imul(ah0, bh0);
    var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
    w0 &= 0x3ffffff;
    /* k = 1 */
    lo = Math.imul(al1, bl0);
    mid = Math.imul(al1, bh0);
    mid = (mid + Math.imul(ah1, bl0)) | 0;
    hi = Math.imul(ah1, bh0);
    lo = (lo + Math.imul(al0, bl1)) | 0;
    mid = (mid + Math.imul(al0, bh1)) | 0;
    mid = (mid + Math.imul(ah0, bl1)) | 0;
    hi = (hi + Math.imul(ah0, bh1)) | 0;
    var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
    w1 &= 0x3ffffff;
    /* k = 2 */
    lo = Math.imul(al2, bl0);
    mid = Math.imul(al2, bh0);
    mid = (mid + Math.imul(ah2, bl0)) | 0;
    hi = Math.imul(ah2, bh0);
    lo = (lo + Math.imul(al1, bl1)) | 0;
    mid = (mid + Math.imul(al1, bh1)) | 0;
    mid = (mid + Math.imul(ah1, bl1)) | 0;
    hi = (hi + Math.imul(ah1, bh1)) | 0;
    lo = (lo + Math.imul(al0, bl2)) | 0;
    mid = (mid + Math.imul(al0, bh2)) | 0;
    mid = (mid + Math.imul(ah0, bl2)) | 0;
    hi = (hi + Math.imul(ah0, bh2)) | 0;
    var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
    w2 &= 0x3ffffff;
    /* k = 3 */
    lo = Math.imul(al3, bl0);
    mid = Math.imul(al3, bh0);
    mid = (mid + Math.imul(ah3, bl0)) | 0;
    hi = Math.imul(ah3, bh0);
    lo = (lo + Math.imul(al2, bl1)) | 0;
    mid = (mid + Math.imul(al2, bh1)) | 0;
    mid = (mid + Math.imul(ah2, bl1)) | 0;
    hi = (hi + Math.imul(ah2, bh1)) | 0;
    lo = (lo + Math.imul(al1, bl2)) | 0;
    mid = (mid + Math.imul(al1, bh2)) | 0;
    mid = (mid + Math.imul(ah1, bl2)) | 0;
    hi = (hi + Math.imul(ah1, bh2)) | 0;
    lo = (lo + Math.imul(al0, bl3)) | 0;
    mid = (mid + Math.imul(al0, bh3)) | 0;
    mid = (mid + Math.imul(ah0, bl3)) | 0;
    hi = (hi + Math.imul(ah0, bh3)) | 0;
    var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
    w3 &= 0x3ffffff;
    /* k = 4 */
    lo = Math.imul(al4, bl0);
    mid = Math.imul(al4, bh0);
    mid = (mid + Math.imul(ah4, bl0)) | 0;
    hi = Math.imul(ah4, bh0);
    lo = (lo + Math.imul(al3, bl1)) | 0;
    mid = (mid + Math.imul(al3, bh1)) | 0;
    mid = (mid + Math.imul(ah3, bl1)) | 0;
    hi = (hi + Math.imul(ah3, bh1)) | 0;
    lo = (lo + Math.imul(al2, bl2)) | 0;
    mid = (mid + Math.imul(al2, bh2)) | 0;
    mid = (mid + Math.imul(ah2, bl2)) | 0;
    hi = (hi + Math.imul(ah2, bh2)) | 0;
    lo = (lo + Math.imul(al1, bl3)) | 0;
    mid = (mid + Math.imul(al1, bh3)) | 0;
    mid = (mid + Math.imul(ah1, bl3)) | 0;
    hi = (hi + Math.imul(ah1, bh3)) | 0;
    lo = (lo + Math.imul(al0, bl4)) | 0;
    mid = (mid + Math.imul(al0, bh4)) | 0;
    mid = (mid + Math.imul(ah0, bl4)) | 0;
    hi = (hi + Math.imul(ah0, bh4)) | 0;
    var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
    w4 &= 0x3ffffff;
    /* k = 5 */
    lo = Math.imul(al5, bl0);
    mid = Math.imul(al5, bh0);
    mid = (mid + Math.imul(ah5, bl0)) | 0;
    hi = Math.imul(ah5, bh0);
    lo = (lo + Math.imul(al4, bl1)) | 0;
    mid = (mid + Math.imul(al4, bh1)) | 0;
    mid = (mid + Math.imul(ah4, bl1)) | 0;
    hi = (hi + Math.imul(ah4, bh1)) | 0;
    lo = (lo + Math.imul(al3, bl2)) | 0;
    mid = (mid + Math.imul(al3, bh2)) | 0;
    mid = (mid + Math.imul(ah3, bl2)) | 0;
    hi = (hi + Math.imul(ah3, bh2)) | 0;
    lo = (lo + Math.imul(al2, bl3)) | 0;
    mid = (mid + Math.imul(al2, bh3)) | 0;
    mid = (mid + Math.imul(ah2, bl3)) | 0;
    hi = (hi + Math.imul(ah2, bh3)) | 0;
    lo = (lo + Math.imul(al1, bl4)) | 0;
    mid = (mid + Math.imul(al1, bh4)) | 0;
    mid = (mid + Math.imul(ah1, bl4)) | 0;
    hi = (hi + Math.imul(ah1, bh4)) | 0;
    lo = (lo + Math.imul(al0, bl5)) | 0;
    mid = (mid + Math.imul(al0, bh5)) | 0;
    mid = (mid + Math.imul(ah0, bl5)) | 0;
    hi = (hi + Math.imul(ah0, bh5)) | 0;
    var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
    w5 &= 0x3ffffff;
    /* k = 6 */
    lo = Math.imul(al6, bl0);
    mid = Math.imul(al6, bh0);
    mid = (mid + Math.imul(ah6, bl0)) | 0;
    hi = Math.imul(ah6, bh0);
    lo = (lo + Math.imul(al5, bl1)) | 0;
    mid = (mid + Math.imul(al5, bh1)) | 0;
    mid = (mid + Math.imul(ah5, bl1)) | 0;
    hi = (hi + Math.imul(ah5, bh1)) | 0;
    lo = (lo + Math.imul(al4, bl2)) | 0;
    mid = (mid + Math.imul(al4, bh2)) | 0;
    mid = (mid + Math.imul(ah4, bl2)) | 0;
    hi = (hi + Math.imul(ah4, bh2)) | 0;
    lo = (lo + Math.imul(al3, bl3)) | 0;
    mid = (mid + Math.imul(al3, bh3)) | 0;
    mid = (mid + Math.imul(ah3, bl3)) | 0;
    hi = (hi + Math.imul(ah3, bh3)) | 0;
    lo = (lo + Math.imul(al2, bl4)) | 0;
    mid = (mid + Math.imul(al2, bh4)) | 0;
    mid = (mid + Math.imul(ah2, bl4)) | 0;
    hi = (hi + Math.imul(ah2, bh4)) | 0;
    lo = (lo + Math.imul(al1, bl5)) | 0;
    mid = (mid + Math.imul(al1, bh5)) | 0;
    mid = (mid + Math.imul(ah1, bl5)) | 0;
    hi = (hi + Math.imul(ah1, bh5)) | 0;
    lo = (lo + Math.imul(al0, bl6)) | 0;
    mid = (mid + Math.imul(al0, bh6)) | 0;
    mid = (mid + Math.imul(ah0, bl6)) | 0;
    hi = (hi + Math.imul(ah0, bh6)) | 0;
    var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
    w6 &= 0x3ffffff;
    /* k = 7 */
    lo = Math.imul(al7, bl0);
    mid = Math.imul(al7, bh0);
    mid = (mid + Math.imul(ah7, bl0)) | 0;
    hi = Math.imul(ah7, bh0);
    lo = (lo + Math.imul(al6, bl1)) | 0;
    mid = (mid + Math.imul(al6, bh1)) | 0;
    mid = (mid + Math.imul(ah6, bl1)) | 0;
    hi = (hi + Math.imul(ah6, bh1)) | 0;
    lo = (lo + Math.imul(al5, bl2)) | 0;
    mid = (mid + Math.imul(al5, bh2)) | 0;
    mid = (mid + Math.imul(ah5, bl2)) | 0;
    hi = (hi + Math.imul(ah5, bh2)) | 0;
    lo = (lo + Math.imul(al4, bl3)) | 0;
    mid = (mid + Math.imul(al4, bh3)) | 0;
    mid = (mid + Math.imul(ah4, bl3)) | 0;
    hi = (hi + Math.imul(ah4, bh3)) | 0;
    lo = (lo + Math.imul(al3, bl4)) | 0;
    mid = (mid + Math.imul(al3, bh4)) | 0;
    mid = (mid + Math.imul(ah3, bl4)) | 0;
    hi = (hi + Math.imul(ah3, bh4)) | 0;
    lo = (lo + Math.imul(al2, bl5)) | 0;
    mid = (mid + Math.imul(al2, bh5)) | 0;
    mid = (mid + Math.imul(ah2, bl5)) | 0;
    hi = (hi + Math.imul(ah2, bh5)) | 0;
    lo = (lo + Math.imul(al1, bl6)) | 0;
    mid = (mid + Math.imul(al1, bh6)) | 0;
    mid = (mid + Math.imul(ah1, bl6)) | 0;
    hi = (hi + Math.imul(ah1, bh6)) | 0;
    lo = (lo + Math.imul(al0, bl7)) | 0;
    mid = (mid + Math.imul(al0, bh7)) | 0;
    mid = (mid + Math.imul(ah0, bl7)) | 0;
    hi = (hi + Math.imul(ah0, bh7)) | 0;
    var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
    w7 &= 0x3ffffff;
    /* k = 8 */
    lo = Math.imul(al8, bl0);
    mid = Math.imul(al8, bh0);
    mid = (mid + Math.imul(ah8, bl0)) | 0;
    hi = Math.imul(ah8, bh0);
    lo = (lo + Math.imul(al7, bl1)) | 0;
    mid = (mid + Math.imul(al7, bh1)) | 0;
    mid = (mid + Math.imul(ah7, bl1)) | 0;
    hi = (hi + Math.imul(ah7, bh1)) | 0;
    lo = (lo + Math.imul(al6, bl2)) | 0;
    mid = (mid + Math.imul(al6, bh2)) | 0;
    mid = (mid + Math.imul(ah6, bl2)) | 0;
    hi = (hi + Math.imul(ah6, bh2)) | 0;
    lo = (lo + Math.imul(al5, bl3)) | 0;
    mid = (mid + Math.imul(al5, bh3)) | 0;
    mid = (mid + Math.imul(ah5, bl3)) | 0;
    hi = (hi + Math.imul(ah5, bh3)) | 0;
    lo = (lo + Math.imul(al4, bl4)) | 0;
    mid = (mid + Math.imul(al4, bh4)) | 0;
    mid = (mid + Math.imul(ah4, bl4)) | 0;
    hi = (hi + Math.imul(ah4, bh4)) | 0;
    lo = (lo + Math.imul(al3, bl5)) | 0;
    mid = (mid + Math.imul(al3, bh5)) | 0;
    mid = (mid + Math.imul(ah3, bl5)) | 0;
    hi = (hi + Math.imul(ah3, bh5)) | 0;
    lo = (lo + Math.imul(al2, bl6)) | 0;
    mid = (mid + Math.imul(al2, bh6)) | 0;
    mid = (mid + Math.imul(ah2, bl6)) | 0;
    hi = (hi + Math.imul(ah2, bh6)) | 0;
    lo = (lo + Math.imul(al1, bl7)) | 0;
    mid = (mid + Math.imul(al1, bh7)) | 0;
    mid = (mid + Math.imul(ah1, bl7)) | 0;
    hi = (hi + Math.imul(ah1, bh7)) | 0;
    lo = (lo + Math.imul(al0, bl8)) | 0;
    mid = (mid + Math.imul(al0, bh8)) | 0;
    mid = (mid + Math.imul(ah0, bl8)) | 0;
    hi = (hi + Math.imul(ah0, bh8)) | 0;
    var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
    w8 &= 0x3ffffff;
    /* k = 9 */
    lo = Math.imul(al9, bl0);
    mid = Math.imul(al9, bh0);
    mid = (mid + Math.imul(ah9, bl0)) | 0;
    hi = Math.imul(ah9, bh0);
    lo = (lo + Math.imul(al8, bl1)) | 0;
    mid = (mid + Math.imul(al8, bh1)) | 0;
    mid = (mid + Math.imul(ah8, bl1)) | 0;
    hi = (hi + Math.imul(ah8, bh1)) | 0;
    lo = (lo + Math.imul(al7, bl2)) | 0;
    mid = (mid + Math.imul(al7, bh2)) | 0;
    mid = (mid + Math.imul(ah7, bl2)) | 0;
    hi = (hi + Math.imul(ah7, bh2)) | 0;
    lo = (lo + Math.imul(al6, bl3)) | 0;
    mid = (mid + Math.imul(al6, bh3)) | 0;
    mid = (mid + Math.imul(ah6, bl3)) | 0;
    hi = (hi + Math.imul(ah6, bh3)) | 0;
    lo = (lo + Math.imul(al5, bl4)) | 0;
    mid = (mid + Math.imul(al5, bh4)) | 0;
    mid = (mid + Math.imul(ah5, bl4)) | 0;
    hi = (hi + Math.imul(ah5, bh4)) | 0;
    lo = (lo + Math.imul(al4, bl5)) | 0;
    mid = (mid + Math.imul(al4, bh5)) | 0;
    mid = (mid + Math.imul(ah4, bl5)) | 0;
    hi = (hi + Math.imul(ah4, bh5)) | 0;
    lo = (lo + Math.imul(al3, bl6)) | 0;
    mid = (mid + Math.imul(al3, bh6)) | 0;
    mid = (mid + Math.imul(ah3, bl6)) | 0;
    hi = (hi + Math.imul(ah3, bh6)) | 0;
    lo = (lo + Math.imul(al2, bl7)) | 0;
    mid = (mid + Math.imul(al2, bh7)) | 0;
    mid = (mid + Math.imul(ah2, bl7)) | 0;
    hi = (hi + Math.imul(ah2, bh7)) | 0;
    lo = (lo + Math.imul(al1, bl8)) | 0;
    mid = (mid + Math.imul(al1, bh8)) | 0;
    mid = (mid + Math.imul(ah1, bl8)) | 0;
    hi = (hi + Math.imul(ah1, bh8)) | 0;
    lo = (lo + Math.imul(al0, bl9)) | 0;
    mid = (mid + Math.imul(al0, bh9)) | 0;
    mid = (mid + Math.imul(ah0, bl9)) | 0;
    hi = (hi + Math.imul(ah0, bh9)) | 0;
    var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
    w9 &= 0x3ffffff;
    /* k = 10 */
    lo = Math.imul(al9, bl1);
    mid = Math.imul(al9, bh1);
    mid = (mid + Math.imul(ah9, bl1)) | 0;
    hi = Math.imul(ah9, bh1);
    lo = (lo + Math.imul(al8, bl2)) | 0;
    mid = (mid + Math.imul(al8, bh2)) | 0;
    mid = (mid + Math.imul(ah8, bl2)) | 0;
    hi = (hi + Math.imul(ah8, bh2)) | 0;
    lo = (lo + Math.imul(al7, bl3)) | 0;
    mid = (mid + Math.imul(al7, bh3)) | 0;
    mid = (mid + Math.imul(ah7, bl3)) | 0;
    hi = (hi + Math.imul(ah7, bh3)) | 0;
    lo = (lo + Math.imul(al6, bl4)) | 0;
    mid = (mid + Math.imul(al6, bh4)) | 0;
    mid = (mid + Math.imul(ah6, bl4)) | 0;
    hi = (hi + Math.imul(ah6, bh4)) | 0;
    lo = (lo + Math.imul(al5, bl5)) | 0;
    mid = (mid + Math.imul(al5, bh5)) | 0;
    mid = (mid + Math.imul(ah5, bl5)) | 0;
    hi = (hi + Math.imul(ah5, bh5)) | 0;
    lo = (lo + Math.imul(al4, bl6)) | 0;
    mid = (mid + Math.imul(al4, bh6)) | 0;
    mid = (mid + Math.imul(ah4, bl6)) | 0;
    hi = (hi + Math.imul(ah4, bh6)) | 0;
    lo = (lo + Math.imul(al3, bl7)) | 0;
    mid = (mid + Math.imul(al3, bh7)) | 0;
    mid = (mid + Math.imul(ah3, bl7)) | 0;
    hi = (hi + Math.imul(ah3, bh7)) | 0;
    lo = (lo + Math.imul(al2, bl8)) | 0;
    mid = (mid + Math.imul(al2, bh8)) | 0;
    mid = (mid + Math.imul(ah2, bl8)) | 0;
    hi = (hi + Math.imul(ah2, bh8)) | 0;
    lo = (lo + Math.imul(al1, bl9)) | 0;
    mid = (mid + Math.imul(al1, bh9)) | 0;
    mid = (mid + Math.imul(ah1, bl9)) | 0;
    hi = (hi + Math.imul(ah1, bh9)) | 0;
    var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
    w10 &= 0x3ffffff;
    /* k = 11 */
    lo = Math.imul(al9, bl2);
    mid = Math.imul(al9, bh2);
    mid = (mid + Math.imul(ah9, bl2)) | 0;
    hi = Math.imul(ah9, bh2);
    lo = (lo + Math.imul(al8, bl3)) | 0;
    mid = (mid + Math.imul(al8, bh3)) | 0;
    mid = (mid + Math.imul(ah8, bl3)) | 0;
    hi = (hi + Math.imul(ah8, bh3)) | 0;
    lo = (lo + Math.imul(al7, bl4)) | 0;
    mid = (mid + Math.imul(al7, bh4)) | 0;
    mid = (mid + Math.imul(ah7, bl4)) | 0;
    hi = (hi + Math.imul(ah7, bh4)) | 0;
    lo = (lo + Math.imul(al6, bl5)) | 0;
    mid = (mid + Math.imul(al6, bh5)) | 0;
    mid = (mid + Math.imul(ah6, bl5)) | 0;
    hi = (hi + Math.imul(ah6, bh5)) | 0;
    lo = (lo + Math.imul(al5, bl6)) | 0;
    mid = (mid + Math.imul(al5, bh6)) | 0;
    mid = (mid + Math.imul(ah5, bl6)) | 0;
    hi = (hi + Math.imul(ah5, bh6)) | 0;
    lo = (lo + Math.imul(al4, bl7)) | 0;
    mid = (mid + Math.imul(al4, bh7)) | 0;
    mid = (mid + Math.imul(ah4, bl7)) | 0;
    hi = (hi + Math.imul(ah4, bh7)) | 0;
    lo = (lo + Math.imul(al3, bl8)) | 0;
    mid = (mid + Math.imul(al3, bh8)) | 0;
    mid = (mid + Math.imul(ah3, bl8)) | 0;
    hi = (hi + Math.imul(ah3, bh8)) | 0;
    lo = (lo + Math.imul(al2, bl9)) | 0;
    mid = (mid + Math.imul(al2, bh9)) | 0;
    mid = (mid + Math.imul(ah2, bl9)) | 0;
    hi = (hi + Math.imul(ah2, bh9)) | 0;
    var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
    w11 &= 0x3ffffff;
    /* k = 12 */
    lo = Math.imul(al9, bl3);
    mid = Math.imul(al9, bh3);
    mid = (mid + Math.imul(ah9, bl3)) | 0;
    hi = Math.imul(ah9, bh3);
    lo = (lo + Math.imul(al8, bl4)) | 0;
    mid = (mid + Math.imul(al8, bh4)) | 0;
    mid = (mid + Math.imul(ah8, bl4)) | 0;
    hi = (hi + Math.imul(ah8, bh4)) | 0;
    lo = (lo + Math.imul(al7, bl5)) | 0;
    mid = (mid + Math.imul(al7, bh5)) | 0;
    mid = (mid + Math.imul(ah7, bl5)) | 0;
    hi = (hi + Math.imul(ah7, bh5)) | 0;
    lo = (lo + Math.imul(al6, bl6)) | 0;
    mid = (mid + Math.imul(al6, bh6)) | 0;
    mid = (mid + Math.imul(ah6, bl6)) | 0;
    hi = (hi + Math.imul(ah6, bh6)) | 0;
    lo = (lo + Math.imul(al5, bl7)) | 0;
    mid = (mid + Math.imul(al5, bh7)) | 0;
    mid = (mid + Math.imul(ah5, bl7)) | 0;
    hi = (hi + Math.imul(ah5, bh7)) | 0;
    lo = (lo + Math.imul(al4, bl8)) | 0;
    mid = (mid + Math.imul(al4, bh8)) | 0;
    mid = (mid + Math.imul(ah4, bl8)) | 0;
    hi = (hi + Math.imul(ah4, bh8)) | 0;
    lo = (lo + Math.imul(al3, bl9)) | 0;
    mid = (mid + Math.imul(al3, bh9)) | 0;
    mid = (mid + Math.imul(ah3, bl9)) | 0;
    hi = (hi + Math.imul(ah3, bh9)) | 0;
    var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
    w12 &= 0x3ffffff;
    /* k = 13 */
    lo = Math.imul(al9, bl4);
    mid = Math.imul(al9, bh4);
    mid = (mid + Math.imul(ah9, bl4)) | 0;
    hi = Math.imul(ah9, bh4);
    lo = (lo + Math.imul(al8, bl5)) | 0;
    mid = (mid + Math.imul(al8, bh5)) | 0;
    mid = (mid + Math.imul(ah8, bl5)) | 0;
    hi = (hi + Math.imul(ah8, bh5)) | 0;
    lo = (lo + Math.imul(al7, bl6)) | 0;
    mid = (mid + Math.imul(al7, bh6)) | 0;
    mid = (mid + Math.imul(ah7, bl6)) | 0;
    hi = (hi + Math.imul(ah7, bh6)) | 0;
    lo = (lo + Math.imul(al6, bl7)) | 0;
    mid = (mid + Math.imul(al6, bh7)) | 0;
    mid = (mid + Math.imul(ah6, bl7)) | 0;
    hi = (hi + Math.imul(ah6, bh7)) | 0;
    lo = (lo + Math.imul(al5, bl8)) | 0;
    mid = (mid + Math.imul(al5, bh8)) | 0;
    mid = (mid + Math.imul(ah5, bl8)) | 0;
    hi = (hi + Math.imul(ah5, bh8)) | 0;
    lo = (lo + Math.imul(al4, bl9)) | 0;
    mid = (mid + Math.imul(al4, bh9)) | 0;
    mid = (mid + Math.imul(ah4, bl9)) | 0;
    hi = (hi + Math.imul(ah4, bh9)) | 0;
    var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
    w13 &= 0x3ffffff;
    /* k = 14 */
    lo = Math.imul(al9, bl5);
    mid = Math.imul(al9, bh5);
    mid = (mid + Math.imul(ah9, bl5)) | 0;
    hi = Math.imul(ah9, bh5);
    lo = (lo + Math.imul(al8, bl6)) | 0;
    mid = (mid + Math.imul(al8, bh6)) | 0;
    mid = (mid + Math.imul(ah8, bl6)) | 0;
    hi = (hi + Math.imul(ah8, bh6)) | 0;
    lo = (lo + Math.imul(al7, bl7)) | 0;
    mid = (mid + Math.imul(al7, bh7)) | 0;
    mid = (mid + Math.imul(ah7, bl7)) | 0;
    hi = (hi + Math.imul(ah7, bh7)) | 0;
    lo = (lo + Math.imul(al6, bl8)) | 0;
    mid = (mid + Math.imul(al6, bh8)) | 0;
    mid = (mid + Math.imul(ah6, bl8)) | 0;
    hi = (hi + Math.imul(ah6, bh8)) | 0;
    lo = (lo + Math.imul(al5, bl9)) | 0;
    mid = (mid + Math.imul(al5, bh9)) | 0;
    mid = (mid + Math.imul(ah5, bl9)) | 0;
    hi = (hi + Math.imul(ah5, bh9)) | 0;
    var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
    w14 &= 0x3ffffff;
    /* k = 15 */
    lo = Math.imul(al9, bl6);
    mid = Math.imul(al9, bh6);
    mid = (mid + Math.imul(ah9, bl6)) | 0;
    hi = Math.imul(ah9, bh6);
    lo = (lo + Math.imul(al8, bl7)) | 0;
    mid = (mid + Math.imul(al8, bh7)) | 0;
    mid = (mid + Math.imul(ah8, bl7)) | 0;
    hi = (hi + Math.imul(ah8, bh7)) | 0;
    lo = (lo + Math.imul(al7, bl8)) | 0;
    mid = (mid + Math.imul(al7, bh8)) | 0;
    mid = (mid + Math.imul(ah7, bl8)) | 0;
    hi = (hi + Math.imul(ah7, bh8)) | 0;
    lo = (lo + Math.imul(al6, bl9)) | 0;
    mid = (mid + Math.imul(al6, bh9)) | 0;
    mid = (mid + Math.imul(ah6, bl9)) | 0;
    hi = (hi + Math.imul(ah6, bh9)) | 0;
    var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
    w15 &= 0x3ffffff;
    /* k = 16 */
    lo = Math.imul(al9, bl7);
    mid = Math.imul(al9, bh7);
    mid = (mid + Math.imul(ah9, bl7)) | 0;
    hi = Math.imul(ah9, bh7);
    lo = (lo + Math.imul(al8, bl8)) | 0;
    mid = (mid + Math.imul(al8, bh8)) | 0;
    mid = (mid + Math.imul(ah8, bl8)) | 0;
    hi = (hi + Math.imul(ah8, bh8)) | 0;
    lo = (lo + Math.imul(al7, bl9)) | 0;
    mid = (mid + Math.imul(al7, bh9)) | 0;
    mid = (mid + Math.imul(ah7, bl9)) | 0;
    hi = (hi + Math.imul(ah7, bh9)) | 0;
    var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
    w16 &= 0x3ffffff;
    /* k = 17 */
    lo = Math.imul(al9, bl8);
    mid = Math.imul(al9, bh8);
    mid = (mid + Math.imul(ah9, bl8)) | 0;
    hi = Math.imul(ah9, bh8);
    lo = (lo + Math.imul(al8, bl9)) | 0;
    mid = (mid + Math.imul(al8, bh9)) | 0;
    mid = (mid + Math.imul(ah8, bl9)) | 0;
    hi = (hi + Math.imul(ah8, bh9)) | 0;
    var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
    w17 &= 0x3ffffff;
    /* k = 18 */
    lo = Math.imul(al9, bl9);
    mid = Math.imul(al9, bh9);
    mid = (mid + Math.imul(ah9, bl9)) | 0;
    hi = Math.imul(ah9, bh9);
    var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
    w18 &= 0x3ffffff;
    o[0] = w0;
    o[1] = w1;
    o[2] = w2;
    o[3] = w3;
    o[4] = w4;
    o[5] = w5;
    o[6] = w6;
    o[7] = w7;
    o[8] = w8;
    o[9] = w9;
    o[10] = w10;
    o[11] = w11;
    o[12] = w12;
    o[13] = w13;
    o[14] = w14;
    o[15] = w15;
    o[16] = w16;
    o[17] = w17;
    o[18] = w18;
    if (c !== 0) {
      o[19] = c;
      out.length++;
    }
    return out;
  };

  // Polyfill comb
  if (!Math.imul) {
    comb10MulTo = smallMulTo;
  }

  function bigMulTo (self, num, out) {
    out.negative = num.negative ^ self.negative;
    out.length = self.length + num.length;

    var carry = 0;
    var hncarry = 0;
    for (var k = 0; k < out.length - 1; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = hncarry;
      hncarry = 0;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);
      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = k - j;
        var a = self.words[i] | 0;
        var b = num.words[j] | 0;
        var r = a * b;

        var lo = r & 0x3ffffff;
        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
        lo = (lo + rword) | 0;
        rword = lo & 0x3ffffff;
        ncarry = (ncarry + (lo >>> 26)) | 0;

        hncarry += ncarry >>> 26;
        ncarry &= 0x3ffffff;
      }
      out.words[k] = rword;
      carry = ncarry;
      ncarry = hncarry;
    }
    if (carry !== 0) {
      out.words[k] = carry;
    } else {
      out.length--;
    }

    return out.strip();
  }

  function jumboMulTo (self, num, out) {
    var fftm = new FFTM();
    return fftm.mulp(self, num, out);
  }

  BN.prototype.mulTo = function mulTo (num, out) {
    var res;
    var len = this.length + num.length;
    if (this.length === 10 && num.length === 10) {
      res = comb10MulTo(this, num, out);
    } else if (len < 63) {
      res = smallMulTo(this, num, out);
    } else if (len < 1024) {
      res = bigMulTo(this, num, out);
    } else {
      res = jumboMulTo(this, num, out);
    }

    return res;
  };

  // Cooley-Tukey algorithm for FFT
  // slightly revisited to rely on looping instead of recursion

  function FFTM (x, y) {
    this.x = x;
    this.y = y;
  }

  FFTM.prototype.makeRBT = function makeRBT (N) {
    var t = new Array(N);
    var l = BN.prototype._countBits(N) - 1;
    for (var i = 0; i < N; i++) {
      t[i] = this.revBin(i, l, N);
    }

    return t;
  };

  // Returns binary-reversed representation of `x`
  FFTM.prototype.revBin = function revBin (x, l, N) {
    if (x === 0 || x === N - 1) return x;

    var rb = 0;
    for (var i = 0; i < l; i++) {
      rb |= (x & 1) << (l - i - 1);
      x >>= 1;
    }

    return rb;
  };

  // Performs "tweedling" phase, therefore 'emulating'
  // behaviour of the recursive algorithm
  FFTM.prototype.permute = function permute (rbt, rws, iws, rtws, itws, N) {
    for (var i = 0; i < N; i++) {
      rtws[i] = rws[rbt[i]];
      itws[i] = iws[rbt[i]];
    }
  };

  FFTM.prototype.transform = function transform (rws, iws, rtws, itws, N, rbt) {
    this.permute(rbt, rws, iws, rtws, itws, N);

    for (var s = 1; s < N; s <<= 1) {
      var l = s << 1;

      var rtwdf = Math.cos(2 * Math.PI / l);
      var itwdf = Math.sin(2 * Math.PI / l);

      for (var p = 0; p < N; p += l) {
        var rtwdf_ = rtwdf;
        var itwdf_ = itwdf;

        for (var j = 0; j < s; j++) {
          var re = rtws[p + j];
          var ie = itws[p + j];

          var ro = rtws[p + j + s];
          var io = itws[p + j + s];

          var rx = rtwdf_ * ro - itwdf_ * io;

          io = rtwdf_ * io + itwdf_ * ro;
          ro = rx;

          rtws[p + j] = re + ro;
          itws[p + j] = ie + io;

          rtws[p + j + s] = re - ro;
          itws[p + j + s] = ie - io;

          /* jshint maxdepth : false */
          if (j !== l) {
            rx = rtwdf * rtwdf_ - itwdf * itwdf_;

            itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
            rtwdf_ = rx;
          }
        }
      }
    }
  };

  FFTM.prototype.guessLen13b = function guessLen13b (n, m) {
    var N = Math.max(m, n) | 1;
    var odd = N & 1;
    var i = 0;
    for (N = N / 2 | 0; N; N = N >>> 1) {
      i++;
    }

    return 1 << i + 1 + odd;
  };

  FFTM.prototype.conjugate = function conjugate (rws, iws, N) {
    if (N <= 1) return;

    for (var i = 0; i < N / 2; i++) {
      var t = rws[i];

      rws[i] = rws[N - i - 1];
      rws[N - i - 1] = t;

      t = iws[i];

      iws[i] = -iws[N - i - 1];
      iws[N - i - 1] = -t;
    }
  };

  FFTM.prototype.normalize13b = function normalize13b (ws, N) {
    var carry = 0;
    for (var i = 0; i < N / 2; i++) {
      var w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
        Math.round(ws[2 * i] / N) +
        carry;

      ws[i] = w & 0x3ffffff;

      if (w < 0x4000000) {
        carry = 0;
      } else {
        carry = w / 0x4000000 | 0;
      }
    }

    return ws;
  };

  FFTM.prototype.convert13b = function convert13b (ws, len, rws, N) {
    var carry = 0;
    for (var i = 0; i < len; i++) {
      carry = carry + (ws[i] | 0);

      rws[2 * i] = carry & 0x1fff; carry = carry >>> 13;
      rws[2 * i + 1] = carry & 0x1fff; carry = carry >>> 13;
    }

    // Pad with zeroes
    for (i = 2 * len; i < N; ++i) {
      rws[i] = 0;
    }

    assert(carry === 0);
    assert((carry & ~0x1fff) === 0);
  };

  FFTM.prototype.stub = function stub (N) {
    var ph = new Array(N);
    for (var i = 0; i < N; i++) {
      ph[i] = 0;
    }

    return ph;
  };

  FFTM.prototype.mulp = function mulp (x, y, out) {
    var N = 2 * this.guessLen13b(x.length, y.length);

    var rbt = this.makeRBT(N);

    var _ = this.stub(N);

    var rws = new Array(N);
    var rwst = new Array(N);
    var iwst = new Array(N);

    var nrws = new Array(N);
    var nrwst = new Array(N);
    var niwst = new Array(N);

    var rmws = out.words;
    rmws.length = N;

    this.convert13b(x.words, x.length, rws, N);
    this.convert13b(y.words, y.length, nrws, N);

    this.transform(rws, _, rwst, iwst, N, rbt);
    this.transform(nrws, _, nrwst, niwst, N, rbt);

    for (var i = 0; i < N; i++) {
      var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
      iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
      rwst[i] = rx;
    }

    this.conjugate(rwst, iwst, N);
    this.transform(rwst, iwst, rmws, _, N, rbt);
    this.conjugate(rmws, _, N);
    this.normalize13b(rmws, N);

    out.negative = x.negative ^ y.negative;
    out.length = x.length + y.length;
    return out.strip();
  };

  // Multiply `this` by `num`
  BN.prototype.mul = function mul (num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return this.mulTo(num, out);
  };

  // Multiply employing FFT
  BN.prototype.mulf = function mulf (num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return jumboMulTo(this, num, out);
  };

  // In-place Multiplication
  BN.prototype.imul = function imul (num) {
    return this.clone().mulTo(num, this);
  };

  BN.prototype.imuln = function imuln (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);

    // Carry
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = (this.words[i] | 0) * num;
      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
      carry >>= 26;
      carry += (w / 0x4000000) | 0;
      // NOTE: lo is 27bit maximum
      carry += lo >>> 26;
      this.words[i] = lo & 0x3ffffff;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return this;
  };

  BN.prototype.muln = function muln (num) {
    return this.clone().imuln(num);
  };

  // `this` * `this`
  BN.prototype.sqr = function sqr () {
    return this.mul(this);
  };

  // `this` * `this` in-place
  BN.prototype.isqr = function isqr () {
    return this.imul(this.clone());
  };

  // Math.pow(`this`, `num`)
  BN.prototype.pow = function pow (num) {
    var w = toBitArray(num);
    if (w.length === 0) return new BN(1);

    // Skip leading zeroes
    var res = this;
    for (var i = 0; i < w.length; i++, res = res.sqr()) {
      if (w[i] !== 0) break;
    }

    if (++i < w.length) {
      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
        if (w[i] === 0) continue;

        res = res.mul(q);
      }
    }

    return res;
  };

  // Shift-left in-place
  BN.prototype.iushln = function iushln (bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;
    var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
    var i;

    if (r !== 0) {
      var carry = 0;

      for (i = 0; i < this.length; i++) {
        var newCarry = this.words[i] & carryMask;
        var c = ((this.words[i] | 0) - newCarry) << r;
        this.words[i] = c | carry;
        carry = newCarry >>> (26 - r);
      }

      if (carry) {
        this.words[i] = carry;
        this.length++;
      }
    }

    if (s !== 0) {
      for (i = this.length - 1; i >= 0; i--) {
        this.words[i + s] = this.words[i];
      }

      for (i = 0; i < s; i++) {
        this.words[i] = 0;
      }

      this.length += s;
    }

    return this.strip();
  };

  BN.prototype.ishln = function ishln (bits) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushln(bits);
  };

  // Shift-right in-place
  // NOTE: `hint` is a lowest bit before trailing zeroes
  // NOTE: if `extended` is present - it will be filled with destroyed bits
  BN.prototype.iushrn = function iushrn (bits, hint, extended) {
    assert(typeof bits === 'number' && bits >= 0);
    var h;
    if (hint) {
      h = (hint - (hint % 26)) / 26;
    } else {
      h = 0;
    }

    var r = bits % 26;
    var s = Math.min((bits - r) / 26, this.length);
    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    var maskedWords = extended;

    h -= s;
    h = Math.max(0, h);

    // Extended mode, copy masked part
    if (maskedWords) {
      for (var i = 0; i < s; i++) {
        maskedWords.words[i] = this.words[i];
      }
      maskedWords.length = s;
    }

    if (s === 0) {
      // No-op, we should not move anything at all
    } else if (this.length > s) {
      this.length -= s;
      for (i = 0; i < this.length; i++) {
        this.words[i] = this.words[i + s];
      }
    } else {
      this.words[0] = 0;
      this.length = 1;
    }

    var carry = 0;
    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
      var word = this.words[i] | 0;
      this.words[i] = (carry << (26 - r)) | (word >>> r);
      carry = word & mask;
    }

    // Push carried bits as a mask
    if (maskedWords && carry !== 0) {
      maskedWords.words[maskedWords.length++] = carry;
    }

    if (this.length === 0) {
      this.words[0] = 0;
      this.length = 1;
    }

    return this.strip();
  };

  BN.prototype.ishrn = function ishrn (bits, hint, extended) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushrn(bits, hint, extended);
  };

  // Shift-left
  BN.prototype.shln = function shln (bits) {
    return this.clone().ishln(bits);
  };

  BN.prototype.ushln = function ushln (bits) {
    return this.clone().iushln(bits);
  };

  // Shift-right
  BN.prototype.shrn = function shrn (bits) {
    return this.clone().ishrn(bits);
  };

  BN.prototype.ushrn = function ushrn (bits) {
    return this.clone().iushrn(bits);
  };

  // Test if n bit is set
  BN.prototype.testn = function testn (bit) {
    assert(typeof bit === 'number' && bit >= 0);
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r;

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) return false;

    // Check bit and return
    var w = this.words[s];

    return !!(w & q);
  };

  // Return only lowers bits of number (in-place)
  BN.prototype.imaskn = function imaskn (bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;

    assert(this.negative === 0, 'imaskn works only with positive numbers');

    if (this.length <= s) {
      return this;
    }

    if (r !== 0) {
      s++;
    }
    this.length = Math.min(s, this.length);

    if (r !== 0) {
      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
      this.words[this.length - 1] &= mask;
    }

    return this.strip();
  };

  // Return only lowers bits of number
  BN.prototype.maskn = function maskn (bits) {
    return this.clone().imaskn(bits);
  };

  // Add plain number `num` to `this`
  BN.prototype.iaddn = function iaddn (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.isubn(-num);

    // Possible sign change
    if (this.negative !== 0) {
      if (this.length === 1 && (this.words[0] | 0) < num) {
        this.words[0] = num - (this.words[0] | 0);
        this.negative = 0;
        return this;
      }

      this.negative = 0;
      this.isubn(num);
      this.negative = 1;
      return this;
    }

    // Add without checks
    return this._iaddn(num);
  };

  BN.prototype._iaddn = function _iaddn (num) {
    this.words[0] += num;

    // Carry
    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000;
      if (i === this.length - 1) {
        this.words[i + 1] = 1;
      } else {
        this.words[i + 1]++;
      }
    }
    this.length = Math.max(this.length, i + 1);

    return this;
  };

  // Subtract plain number `num` from `this`
  BN.prototype.isubn = function isubn (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.iaddn(-num);

    if (this.negative !== 0) {
      this.negative = 0;
      this.iaddn(num);
      this.negative = 1;
      return this;
    }

    this.words[0] -= num;

    if (this.length === 1 && this.words[0] < 0) {
      this.words[0] = -this.words[0];
      this.negative = 1;
    } else {
      // Carry
      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000;
        this.words[i + 1] -= 1;
      }
    }

    return this.strip();
  };

  BN.prototype.addn = function addn (num) {
    return this.clone().iaddn(num);
  };

  BN.prototype.subn = function subn (num) {
    return this.clone().isubn(num);
  };

  BN.prototype.iabs = function iabs () {
    this.negative = 0;

    return this;
  };

  BN.prototype.abs = function abs () {
    return this.clone().iabs();
  };

  BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
    var len = num.length + shift;
    var i;

    this._expand(len);

    var w;
    var carry = 0;
    for (i = 0; i < num.length; i++) {
      w = (this.words[i + shift] | 0) + carry;
      var right = (num.words[i] | 0) * mul;
      w -= right & 0x3ffffff;
      carry = (w >> 26) - ((right / 0x4000000) | 0);
      this.words[i + shift] = w & 0x3ffffff;
    }
    for (; i < this.length - shift; i++) {
      w = (this.words[i + shift] | 0) + carry;
      carry = w >> 26;
      this.words[i + shift] = w & 0x3ffffff;
    }

    if (carry === 0) return this.strip();

    // Subtraction overflow
    assert(carry === -1);
    carry = 0;
    for (i = 0; i < this.length; i++) {
      w = -(this.words[i] | 0) + carry;
      carry = w >> 26;
      this.words[i] = w & 0x3ffffff;
    }
    this.negative = 1;

    return this.strip();
  };

  BN.prototype._wordDiv = function _wordDiv (num, mode) {
    var shift = this.length - num.length;

    var a = this.clone();
    var b = num;

    // Normalize
    var bhi = b.words[b.length - 1] | 0;
    var bhiBits = this._countBits(bhi);
    shift = 26 - bhiBits;
    if (shift !== 0) {
      b = b.ushln(shift);
      a.iushln(shift);
      bhi = b.words[b.length - 1] | 0;
    }

    // Initialize quotient
    var m = a.length - b.length;
    var q;

    if (mode !== 'mod') {
      q = new BN(null);
      q.length = m + 1;
      q.words = new Array(q.length);
      for (var i = 0; i < q.length; i++) {
        q.words[i] = 0;
      }
    }

    var diff = a.clone()._ishlnsubmul(b, 1, m);
    if (diff.negative === 0) {
      a = diff;
      if (q) {
        q.words[m] = 1;
      }
    }

    for (var j = m - 1; j >= 0; j--) {
      var qj = (a.words[b.length + j] | 0) * 0x4000000 +
        (a.words[b.length + j - 1] | 0);

      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
      // (0x7ffffff)
      qj = Math.min((qj / bhi) | 0, 0x3ffffff);

      a._ishlnsubmul(b, qj, j);
      while (a.negative !== 0) {
        qj--;
        a.negative = 0;
        a._ishlnsubmul(b, 1, j);
        if (!a.isZero()) {
          a.negative ^= 1;
        }
      }
      if (q) {
        q.words[j] = qj;
      }
    }
    if (q) {
      q.strip();
    }
    a.strip();

    // Denormalize
    if (mode !== 'div' && shift !== 0) {
      a.iushrn(shift);
    }

    return {
      div: q || null,
      mod: a
    };
  };

  // NOTE: 1) `mode` can be set to `mod` to request mod only,
  //       to `div` to request div only, or be absent to
  //       request both div & mod
  //       2) `positive` is true if unsigned mod is requested
  BN.prototype.divmod = function divmod (num, mode, positive) {
    assert(!num.isZero());

    if (this.isZero()) {
      return {
        div: new BN(0),
        mod: new BN(0)
      };
    }

    var div, mod, res;
    if (this.negative !== 0 && num.negative === 0) {
      res = this.neg().divmod(num, mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      if (mode !== 'div') {
        mod = res.mod.neg();
        if (positive && mod.negative !== 0) {
          mod.iadd(num);
        }
      }

      return {
        div: div,
        mod: mod
      };
    }

    if (this.negative === 0 && num.negative !== 0) {
      res = this.divmod(num.neg(), mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      return {
        div: div,
        mod: res.mod
      };
    }

    if ((this.negative & num.negative) !== 0) {
      res = this.neg().divmod(num.neg(), mode);

      if (mode !== 'div') {
        mod = res.mod.neg();
        if (positive && mod.negative !== 0) {
          mod.isub(num);
        }
      }

      return {
        div: res.div,
        mod: mod
      };
    }

    // Both numbers are positive at this point

    // Strip both numbers to approximate shift value
    if (num.length > this.length || this.cmp(num) < 0) {
      return {
        div: new BN(0),
        mod: this
      };
    }

    // Very short reduction
    if (num.length === 1) {
      if (mode === 'div') {
        return {
          div: this.divn(num.words[0]),
          mod: null
        };
      }

      if (mode === 'mod') {
        return {
          div: null,
          mod: new BN(this.modn(num.words[0]))
        };
      }

      return {
        div: this.divn(num.words[0]),
        mod: new BN(this.modn(num.words[0]))
      };
    }

    return this._wordDiv(num, mode);
  };

  // Find `this` / `num`
  BN.prototype.div = function div (num) {
    return this.divmod(num, 'div', false).div;
  };

  // Find `this` % `num`
  BN.prototype.mod = function mod (num) {
    return this.divmod(num, 'mod', false).mod;
  };

  BN.prototype.umod = function umod (num) {
    return this.divmod(num, 'mod', true).mod;
  };

  // Find Round(`this` / `num`)
  BN.prototype.divRound = function divRound (num) {
    var dm = this.divmod(num);

    // Fast case - exact division
    if (dm.mod.isZero()) return dm.div;

    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

    var half = num.ushrn(1);
    var r2 = num.andln(1);
    var cmp = mod.cmp(half);

    // Round down
    if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

    // Round up
    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
  };

  BN.prototype.modn = function modn (num) {
    assert(num <= 0x3ffffff);
    var p = (1 << 26) % num;

    var acc = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      acc = (p * acc + (this.words[i] | 0)) % num;
    }

    return acc;
  };

  // In-place division by number
  BN.prototype.idivn = function idivn (num) {
    assert(num <= 0x3ffffff);

    var carry = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      var w = (this.words[i] | 0) + carry * 0x4000000;
      this.words[i] = (w / num) | 0;
      carry = w % num;
    }

    return this.strip();
  };

  BN.prototype.divn = function divn (num) {
    return this.clone().idivn(num);
  };

  BN.prototype.egcd = function egcd (p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    var x = this;
    var y = p.clone();

    if (x.negative !== 0) {
      x = x.umod(p);
    } else {
      x = x.clone();
    }

    // A * x + B * y = x
    var A = new BN(1);
    var B = new BN(0);

    // C * x + D * y = y
    var C = new BN(0);
    var D = new BN(1);

    var g = 0;

    while (x.isEven() && y.isEven()) {
      x.iushrn(1);
      y.iushrn(1);
      ++g;
    }

    var yp = y.clone();
    var xp = x.clone();

    while (!x.isZero()) {
      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        x.iushrn(i);
        while (i-- > 0) {
          if (A.isOdd() || B.isOdd()) {
            A.iadd(yp);
            B.isub(xp);
          }

          A.iushrn(1);
          B.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        y.iushrn(j);
        while (j-- > 0) {
          if (C.isOdd() || D.isOdd()) {
            C.iadd(yp);
            D.isub(xp);
          }

          C.iushrn(1);
          D.iushrn(1);
        }
      }

      if (x.cmp(y) >= 0) {
        x.isub(y);
        A.isub(C);
        B.isub(D);
      } else {
        y.isub(x);
        C.isub(A);
        D.isub(B);
      }
    }

    return {
      a: C,
      b: D,
      gcd: y.iushln(g)
    };
  };

  // This is reduced incarnation of the binary EEA
  // above, designated to invert members of the
  // _prime_ fields F(p) at a maximal speed
  BN.prototype._invmp = function _invmp (p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    var a = this;
    var b = p.clone();

    if (a.negative !== 0) {
      a = a.umod(p);
    } else {
      a = a.clone();
    }

    var x1 = new BN(1);
    var x2 = new BN(0);

    var delta = b.clone();

    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        a.iushrn(i);
        while (i-- > 0) {
          if (x1.isOdd()) {
            x1.iadd(delta);
          }

          x1.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        b.iushrn(j);
        while (j-- > 0) {
          if (x2.isOdd()) {
            x2.iadd(delta);
          }

          x2.iushrn(1);
        }
      }

      if (a.cmp(b) >= 0) {
        a.isub(b);
        x1.isub(x2);
      } else {
        b.isub(a);
        x2.isub(x1);
      }
    }

    var res;
    if (a.cmpn(1) === 0) {
      res = x1;
    } else {
      res = x2;
    }

    if (res.cmpn(0) < 0) {
      res.iadd(p);
    }

    return res;
  };

  BN.prototype.gcd = function gcd (num) {
    if (this.isZero()) return num.abs();
    if (num.isZero()) return this.abs();

    var a = this.clone();
    var b = num.clone();
    a.negative = 0;
    b.negative = 0;

    // Remove common factor of two
    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
      a.iushrn(1);
      b.iushrn(1);
    }

    do {
      while (a.isEven()) {
        a.iushrn(1);
      }
      while (b.isEven()) {
        b.iushrn(1);
      }

      var r = a.cmp(b);
      if (r < 0) {
        // Swap `a` and `b` to make `a` always bigger than `b`
        var t = a;
        a = b;
        b = t;
      } else if (r === 0 || b.cmpn(1) === 0) {
        break;
      }

      a.isub(b);
    } while (true);

    return b.iushln(shift);
  };

  // Invert number in the field F(num)
  BN.prototype.invm = function invm (num) {
    return this.egcd(num).a.umod(num);
  };

  BN.prototype.isEven = function isEven () {
    return (this.words[0] & 1) === 0;
  };

  BN.prototype.isOdd = function isOdd () {
    return (this.words[0] & 1) === 1;
  };

  // And first word and num
  BN.prototype.andln = function andln (num) {
    return this.words[0] & num;
  };

  // Increment at the bit position in-line
  BN.prototype.bincn = function bincn (bit) {
    assert(typeof bit === 'number');
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r;

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) {
      this._expand(s + 1);
      this.words[s] |= q;
      return this;
    }

    // Add bit and propagate, if needed
    var carry = q;
    for (var i = s; carry !== 0 && i < this.length; i++) {
      var w = this.words[i] | 0;
      w += carry;
      carry = w >>> 26;
      w &= 0x3ffffff;
      this.words[i] = w;
    }
    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }
    return this;
  };

  BN.prototype.isZero = function isZero () {
    return this.length === 1 && this.words[0] === 0;
  };

  BN.prototype.cmpn = function cmpn (num) {
    var negative = num < 0;

    if (this.negative !== 0 && !negative) return -1;
    if (this.negative === 0 && negative) return 1;

    this.strip();

    var res;
    if (this.length > 1) {
      res = 1;
    } else {
      if (negative) {
        num = -num;
      }

      assert(num <= 0x3ffffff, 'Number is too big');

      var w = this.words[0] | 0;
      res = w === num ? 0 : w < num ? -1 : 1;
    }
    if (this.negative !== 0) return -res | 0;
    return res;
  };

  // Compare two numbers and return:
  // 1 - if `this` > `num`
  // 0 - if `this` == `num`
  // -1 - if `this` < `num`
  BN.prototype.cmp = function cmp (num) {
    if (this.negative !== 0 && num.negative === 0) return -1;
    if (this.negative === 0 && num.negative !== 0) return 1;

    var res = this.ucmp(num);
    if (this.negative !== 0) return -res | 0;
    return res;
  };

  // Unsigned comparison
  BN.prototype.ucmp = function ucmp (num) {
    // At this point both numbers have the same sign
    if (this.length > num.length) return 1;
    if (this.length < num.length) return -1;

    var res = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      var a = this.words[i] | 0;
      var b = num.words[i] | 0;

      if (a === b) continue;
      if (a < b) {
        res = -1;
      } else if (a > b) {
        res = 1;
      }
      break;
    }
    return res;
  };

  BN.prototype.gtn = function gtn (num) {
    return this.cmpn(num) === 1;
  };

  BN.prototype.gt = function gt (num) {
    return this.cmp(num) === 1;
  };

  BN.prototype.gten = function gten (num) {
    return this.cmpn(num) >= 0;
  };

  BN.prototype.gte = function gte (num) {
    return this.cmp(num) >= 0;
  };

  BN.prototype.ltn = function ltn (num) {
    return this.cmpn(num) === -1;
  };

  BN.prototype.lt = function lt (num) {
    return this.cmp(num) === -1;
  };

  BN.prototype.lten = function lten (num) {
    return this.cmpn(num) <= 0;
  };

  BN.prototype.lte = function lte (num) {
    return this.cmp(num) <= 0;
  };

  BN.prototype.eqn = function eqn (num) {
    return this.cmpn(num) === 0;
  };

  BN.prototype.eq = function eq (num) {
    return this.cmp(num) === 0;
  };

  //
  // A reduce context, could be using montgomery or something better, depending
  // on the `m` itself.
  //
  BN.red = function red (num) {
    return new Red(num);
  };

  BN.prototype.toRed = function toRed (ctx) {
    assert(!this.red, 'Already a number in reduction context');
    assert(this.negative === 0, 'red works only with positives');
    return ctx.convertTo(this)._forceRed(ctx);
  };

  BN.prototype.fromRed = function fromRed () {
    assert(this.red, 'fromRed works only with numbers in reduction context');
    return this.red.convertFrom(this);
  };

  BN.prototype._forceRed = function _forceRed (ctx) {
    this.red = ctx;
    return this;
  };

  BN.prototype.forceRed = function forceRed (ctx) {
    assert(!this.red, 'Already a number in reduction context');
    return this._forceRed(ctx);
  };

  BN.prototype.redAdd = function redAdd (num) {
    assert(this.red, 'redAdd works only with red numbers');
    return this.red.add(this, num);
  };

  BN.prototype.redIAdd = function redIAdd (num) {
    assert(this.red, 'redIAdd works only with red numbers');
    return this.red.iadd(this, num);
  };

  BN.prototype.redSub = function redSub (num) {
    assert(this.red, 'redSub works only with red numbers');
    return this.red.sub(this, num);
  };

  BN.prototype.redISub = function redISub (num) {
    assert(this.red, 'redISub works only with red numbers');
    return this.red.isub(this, num);
  };

  BN.prototype.redShl = function redShl (num) {
    assert(this.red, 'redShl works only with red numbers');
    return this.red.shl(this, num);
  };

  BN.prototype.redMul = function redMul (num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.mul(this, num);
  };

  BN.prototype.redIMul = function redIMul (num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.imul(this, num);
  };

  BN.prototype.redSqr = function redSqr () {
    assert(this.red, 'redSqr works only with red numbers');
    this.red._verify1(this);
    return this.red.sqr(this);
  };

  BN.prototype.redISqr = function redISqr () {
    assert(this.red, 'redISqr works only with red numbers');
    this.red._verify1(this);
    return this.red.isqr(this);
  };

  // Square root over p
  BN.prototype.redSqrt = function redSqrt () {
    assert(this.red, 'redSqrt works only with red numbers');
    this.red._verify1(this);
    return this.red.sqrt(this);
  };

  BN.prototype.redInvm = function redInvm () {
    assert(this.red, 'redInvm works only with red numbers');
    this.red._verify1(this);
    return this.red.invm(this);
  };

  // Return negative clone of `this` % `red modulo`
  BN.prototype.redNeg = function redNeg () {
    assert(this.red, 'redNeg works only with red numbers');
    this.red._verify1(this);
    return this.red.neg(this);
  };

  BN.prototype.redPow = function redPow (num) {
    assert(this.red && !num.red, 'redPow(normalNum)');
    this.red._verify1(this);
    return this.red.pow(this, num);
  };

  // Prime numbers with efficient reduction
  var primes = {
    k256: null,
    p224: null,
    p192: null,
    p25519: null
  };

  // Pseudo-Mersenne prime
  function MPrime (name, p) {
    // P = 2 ^ N - K
    this.name = name;
    this.p = new BN(p, 16);
    this.n = this.p.bitLength();
    this.k = new BN(1).iushln(this.n).isub(this.p);

    this.tmp = this._tmp();
  }

  MPrime.prototype._tmp = function _tmp () {
    var tmp = new BN(null);
    tmp.words = new Array(Math.ceil(this.n / 13));
    return tmp;
  };

  MPrime.prototype.ireduce = function ireduce (num) {
    // Assumes that `num` is less than `P^2`
    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
    var r = num;
    var rlen;

    do {
      this.split(r, this.tmp);
      r = this.imulK(r);
      r = r.iadd(this.tmp);
      rlen = r.bitLength();
    } while (rlen > this.n);

    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
    if (cmp === 0) {
      r.words[0] = 0;
      r.length = 1;
    } else if (cmp > 0) {
      r.isub(this.p);
    } else {
      r.strip();
    }

    return r;
  };

  MPrime.prototype.split = function split (input, out) {
    input.iushrn(this.n, 0, out);
  };

  MPrime.prototype.imulK = function imulK (num) {
    return num.imul(this.k);
  };

  function K256 () {
    MPrime.call(
      this,
      'k256',
      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
  }
  inherits(K256, MPrime);

  K256.prototype.split = function split (input, output) {
    // 256 = 9 * 26 + 22
    var mask = 0x3fffff;

    var outLen = Math.min(input.length, 9);
    for (var i = 0; i < outLen; i++) {
      output.words[i] = input.words[i];
    }
    output.length = outLen;

    if (input.length <= 9) {
      input.words[0] = 0;
      input.length = 1;
      return;
    }

    // Shift by 9 limbs
    var prev = input.words[9];
    output.words[output.length++] = prev & mask;

    for (i = 10; i < input.length; i++) {
      var next = input.words[i] | 0;
      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
      prev = next;
    }
    prev >>>= 22;
    input.words[i - 10] = prev;
    if (prev === 0 && input.length > 10) {
      input.length -= 10;
    } else {
      input.length -= 9;
    }
  };

  K256.prototype.imulK = function imulK (num) {
    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
    num.words[num.length] = 0;
    num.words[num.length + 1] = 0;
    num.length += 2;

    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
    var lo = 0;
    for (var i = 0; i < num.length; i++) {
      var w = num.words[i] | 0;
      lo += w * 0x3d1;
      num.words[i] = lo & 0x3ffffff;
      lo = w * 0x40 + ((lo / 0x4000000) | 0);
    }

    // Fast length reduction
    if (num.words[num.length - 1] === 0) {
      num.length--;
      if (num.words[num.length - 1] === 0) {
        num.length--;
      }
    }
    return num;
  };

  function P224 () {
    MPrime.call(
      this,
      'p224',
      'ffffffff ffffffff ffffffff ffffffff 0 0 00000001');
  }
  inherits(P224, MPrime);

  function P192 () {
    MPrime.call(
      this,
      'p192',
      'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
  }
  inherits(P192, MPrime);

  function P25519 () {
    // 2 ^ 255 - 19
    MPrime.call(
      this,
      '25519',
      '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
  }
  inherits(P25519, MPrime);

  P25519.prototype.imulK = function imulK (num) {
    // K = 0x13
    var carry = 0;
    for (var i = 0; i < num.length; i++) {
      var hi = (num.words[i] | 0) * 0x13 + carry;
      var lo = hi & 0x3ffffff;
      hi >>>= 26;

      num.words[i] = lo;
      carry = hi;
    }
    if (carry !== 0) {
      num.words[num.length++] = carry;
    }
    return num;
  };

  // Exported mostly for testing purposes, use plain name instead
  BN._prime = function prime (name) {
    // Cached version of prime
    if (primes[name]) return primes[name];

    var prime;
    if (name === 'k256') {
      prime = new K256();
    } else if (name === 'p224') {
      prime = new P224();
    } else if (name === 'p192') {
      prime = new P192();
    } else if (name === 'p25519') {
      prime = new P25519();
    } else {
      throw new Error('Unknown prime ' + name);
    }
    primes[name] = prime;

    return prime;
  };

  //
  // Base reduction engine
  //
  function Red (m) {
    if (typeof m === 'string') {
      var prime = BN._prime(m);
      this.m = prime.p;
      this.prime = prime;
    } else {
      assert(m.gtn(1), 'modulus must be greater than 1');
      this.m = m;
      this.prime = null;
    }
  }

  Red.prototype._verify1 = function _verify1 (a) {
    assert(a.negative === 0, 'red works only with positives');
    assert(a.red, 'red works only with red numbers');
  };

  Red.prototype._verify2 = function _verify2 (a, b) {
    assert((a.negative | b.negative) === 0, 'red works only with positives');
    assert(a.red && a.red === b.red,
      'red works only with red numbers');
  };

  Red.prototype.imod = function imod (a) {
    if (this.prime) return this.prime.ireduce(a)._forceRed(this);
    return a.umod(this.m)._forceRed(this);
  };

  Red.prototype.neg = function neg (a) {
    if (a.isZero()) {
      return a.clone();
    }

    return this.m.sub(a)._forceRed(this);
  };

  Red.prototype.add = function add (a, b) {
    this._verify2(a, b);

    var res = a.add(b);
    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }
    return res._forceRed(this);
  };

  Red.prototype.iadd = function iadd (a, b) {
    this._verify2(a, b);

    var res = a.iadd(b);
    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }
    return res;
  };

  Red.prototype.sub = function sub (a, b) {
    this._verify2(a, b);

    var res = a.sub(b);
    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }
    return res._forceRed(this);
  };

  Red.prototype.isub = function isub (a, b) {
    this._verify2(a, b);

    var res = a.isub(b);
    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }
    return res;
  };

  Red.prototype.shl = function shl (a, num) {
    this._verify1(a);
    return this.imod(a.ushln(num));
  };

  Red.prototype.imul = function imul (a, b) {
    this._verify2(a, b);
    return this.imod(a.imul(b));
  };

  Red.prototype.mul = function mul (a, b) {
    this._verify2(a, b);
    return this.imod(a.mul(b));
  };

  Red.prototype.isqr = function isqr (a) {
    return this.imul(a, a.clone());
  };

  Red.prototype.sqr = function sqr (a) {
    return this.mul(a, a);
  };

  Red.prototype.sqrt = function sqrt (a) {
    if (a.isZero()) return a.clone();

    var mod3 = this.m.andln(3);
    assert(mod3 % 2 === 1);

    // Fast case
    if (mod3 === 3) {
      var pow = this.m.add(new BN(1)).iushrn(2);
      return this.pow(a, pow);
    }

    // Tonelli-Shanks algorithm (Totally unoptimized and slow)
    //
    // Find Q and S, that Q * 2 ^ S = (P - 1)
    var q = this.m.subn(1);
    var s = 0;
    while (!q.isZero() && q.andln(1) === 0) {
      s++;
      q.iushrn(1);
    }
    assert(!q.isZero());

    var one = new BN(1).toRed(this);
    var nOne = one.redNeg();

    // Find quadratic non-residue
    // NOTE: Max is such because of generalized Riemann hypothesis.
    var lpow = this.m.subn(1).iushrn(1);
    var z = this.m.bitLength();
    z = new BN(2 * z * z).toRed(this);

    while (this.pow(z, lpow).cmp(nOne) !== 0) {
      z.redIAdd(nOne);
    }

    var c = this.pow(z, q);
    var r = this.pow(a, q.addn(1).iushrn(1));
    var t = this.pow(a, q);
    var m = s;
    while (t.cmp(one) !== 0) {
      var tmp = t;
      for (var i = 0; tmp.cmp(one) !== 0; i++) {
        tmp = tmp.redSqr();
      }
      assert(i < m);
      var b = this.pow(c, new BN(1).iushln(m - i - 1));

      r = r.redMul(b);
      c = b.redSqr();
      t = t.redMul(c);
      m = i;
    }

    return r;
  };

  Red.prototype.invm = function invm (a) {
    var inv = a._invmp(this.m);
    if (inv.negative !== 0) {
      inv.negative = 0;
      return this.imod(inv).redNeg();
    } else {
      return this.imod(inv);
    }
  };

  Red.prototype.pow = function pow (a, num) {
    if (num.isZero()) return new BN(1);
    if (num.cmpn(1) === 0) return a.clone();

    var windowSize = 4;
    var wnd = new Array(1 << windowSize);
    wnd[0] = new BN(1).toRed(this);
    wnd[1] = a;
    for (var i = 2; i < wnd.length; i++) {
      wnd[i] = this.mul(wnd[i - 1], a);
    }

    var res = wnd[0];
    var current = 0;
    var currentLen = 0;
    var start = num.bitLength() % 26;
    if (start === 0) {
      start = 26;
    }

    for (i = num.length - 1; i >= 0; i--) {
      var word = num.words[i];
      for (var j = start - 1; j >= 0; j--) {
        var bit = (word >> j) & 1;
        if (res !== wnd[0]) {
          res = this.sqr(res);
        }

        if (bit === 0 && current === 0) {
          currentLen = 0;
          continue;
        }

        current <<= 1;
        current |= bit;
        currentLen++;
        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

        res = this.mul(res, wnd[current]);
        currentLen = 0;
        current = 0;
      }
      start = 26;
    }

    return res;
  };

  Red.prototype.convertTo = function convertTo (num) {
    var r = num.umod(this.m);

    return r === num ? r.clone() : r;
  };

  Red.prototype.convertFrom = function convertFrom (num) {
    var res = num.clone();
    res.red = null;
    return res;
  };

  //
  // Montgomery method engine
  //

  BN.mont = function mont (num) {
    return new Mont(num);
  };

  function Mont (m) {
    Red.call(this, m);

    this.shift = this.m.bitLength();
    if (this.shift % 26 !== 0) {
      this.shift += 26 - (this.shift % 26);
    }

    this.r = new BN(1).iushln(this.shift);
    this.r2 = this.imod(this.r.sqr());
    this.rinv = this.r._invmp(this.m);

    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
    this.minv = this.minv.umod(this.r);
    this.minv = this.r.sub(this.minv);
  }
  inherits(Mont, Red);

  Mont.prototype.convertTo = function convertTo (num) {
    return this.imod(num.ushln(this.shift));
  };

  Mont.prototype.convertFrom = function convertFrom (num) {
    var r = this.imod(num.mul(this.rinv));
    r.red = null;
    return r;
  };

  Mont.prototype.imul = function imul (a, b) {
    if (a.isZero() || b.isZero()) {
      a.words[0] = 0;
      a.length = 1;
      return a;
    }

    var t = a.imul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.mul = function mul (a, b) {
    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

    var t = a.mul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;
    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.invm = function invm (a) {
    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
    var res = this.imod(a._invmp(this.m).mul(this.r2));
    return res._forceRed(this);
  };
})(typeof module === 'undefined' || module, this);

},{}],278:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event. * @api public */ EventEmitter.prototype.emit=function emit(event,a1,a2,a3,a4,a5){var evt=prefix ? prefix + event :event;if (!this._events || !this._events[evt]) return false;var listeners=this._events[evt],len=arguments.length,args,i;if ('function'===typeof listeners.fn){if (listeners.once) this.removeListener(event,listeners.fn,undefined,true);switch (len){case 1:return listeners.fn.call(listeners.context),true;case 2:return listeners.fn.call(listeners.context,a1),true;case 3:return listeners.fn.call(listeners.context,a1,a2),true;case 4:return listeners.fn.call(listeners.context,a1,a2,a3),true;case 5:return listeners.fn.call(listeners.context,a1,a2,a3,a4),true;case 6:return listeners.fn.call(listeners.context,a1,a2,a3,a4,a5),true}for (i=1,args=new Array(len -1);i < len;i++){args[i - 1]=arguments[i]}listeners.fn.apply(listeners.context,args)}else{var length=listeners.length,j;for (i=0;i < length;i++){if (listeners[i].once) this.removeListener(event,listeners[i].fn,undefined,true);switch (len){case 1:listeners[i].fn.call(listeners[i].context);break;case 2:listeners[i].fn.call(listeners[i].context,a1);break;case 3:listeners[i].fn.call(listeners[i].context,a1,a2);break;default:if (!args) for (j=1,args=new Array(len -1);j < len;j++){args[j - 1]=arguments[j]}listeners[i].fn.apply(listeners[i].context,args)}}}return true};EventEmitter.prototype.on=function on(event,fn,context){var listener=new EE(fn,context || this),evt=prefix ? prefix + event :event;:Object.create(null);if (!this._events[evt]) this._events[evt]=listener;else{if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt]=[this._events[evt],listener]}return this};EventEmitter.prototype.once=function once(event,fn,context){var listener=new EE(fn,context || this,true),evt=prefix ? prefix + event :event;:Object.create(null);if (!this._events[evt]) this._events[evt]=listener;else{if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt]=[this._events[evt],listener]}return this};EventEmitter.prototype.removeListener=function removeListener(event,fn,context,once){var evt=prefix ? prefix + event :event;if (!this._events || !this._events[evt]) return this;var listeners=this._events[evt],events=[];if (fn){if (listeners.fn){if (listeners.fn !==fn || (once && !listeners.once) || (context && listeners.context !==context)){events.push(listeners)}}else{for (var i=0,length=listeners.length;i < length;i++){if (listeners[i].fn !==fn || (once && !listeners[i].once) || (context && listeners[i].context !==context)){events.push(listeners[i])}}}}// // Reset the array,or remove it completely if we have no more listeners. // if (events.length){this._events[evt]=events.length===1 ? events[0]:events}else{delete this._events[evt]}return this};EventEmitter.prototype.removeAllListeners=function removeAllListeners(event){if (!this._events) return this;if (event) delete this._events[prefix ? prefix + event :event];:Object.create(null);return this};// // Alias methods names because people roll like that. // EventEmitter.prototype.off=EventEmitter.prototype.removeListener;EventEmitter.prototype.addListener=EventEmitter.prototype.on;// // This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],279:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"dup":85,"md5.js":302,"safe-buffer":334}],280:[function(require,module,exports){
'use strict';

var isCallable = require('is-callable');

var toStr = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

var forEach = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (toStr.call(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

module.exports = forEach;

},{"is-callable":299}],281:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],282:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"dup":86,"inherits":298,"safe-buffer":334,"stream":157}],283:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"./hash/common":284,"./hash/hmac":285,"./hash/ripemd":286,"./hash/sha":287,"./hash/utils":294,"dup":87}],284:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"./utils":294,"dup":88,"minimalistic-assert":304}],285:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"./utils":294,"dup":89,"minimalistic-assert":304}],286:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"./common":284,"./utils":294,"dup":90}],287:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"./sha/1":288,"./sha/224":289,"./sha/256":290,"./sha/384":291,"./sha/512":292,"dup":91}],288:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"../common":284,"../utils":294,"./common":293,"dup":92}],289:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"../utils":294,"./256":290,"dup":93}],290:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"../common":284,"../utils":294,"./common":293,"dup":94,"minimalistic-assert":304}],291:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"../utils":294,"./512":292,"dup":95}],292:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"../common":284,"../utils":294,"dup":96,"minimalistic-assert":304}],293:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"../utils":294,"dup":97}],294:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"dup":98,"inherits":298,"minimalistic-assert":304}],295:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"dup":99,"hash.js":283,"minimalistic-assert":304,"minimalistic-crypto-utils":305}],296:[function(require,module,exports){
/* This file is generated from the Unicode IDNA table, using
   the build-unicode-tables.py script. Please edit that
   script instead of this file. */

/* istanbul ignore next */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () { return factory(); });
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.uts46_map = factory();
  }
}(this, function () {
var blocks = [
  new Uint32Array([2157250,2157314,2157378,2157442,2157506,2157570,2157634,0,2157698,2157762,2157826,2157890,2157954,0,2158018,0]),
  new Uint32Array([2179041,6291456,2179073,6291456,2179105,6291456,2179137,6291456,2179169,6291456,2179201,6291456,2179233,6291456,2179265,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,14680064,14680064,14680064,14680064,14680064]),
  new Uint32Array([0,2113729,2197345,2197377,2113825,2197409,2197441,2113921,2197473,2114017,2197505,2197537,2197569,2197601,2197633,2197665]),
  new Uint32Array([6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,23068672,23068672,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,0,0,0,23068672,23068672,23068672,0,0,0,0,23068672]),
  new Uint32Array([14680064,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,14680064,14680064]),
  new Uint32Array([2196001,2196033,2196065,2196097,2196129,2196161,2196193,2196225,2196257,2196289,2196321,2196353,2196385,2196417,2196449,2196481]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,6291456,0,0,0,0,0]),
  new Uint32Array([2097281,2105921,2097729,2106081,0,2097601,2162337,2106017,2133281,2097505,2105889,2097185,2097697,2135777,2097633,2097441]),
  new Uint32Array([2177025,6291456,2177057,6291456,2177089,6291456,2177121,6291456,2177153,6291456,2177185,6291456,2177217,6291456,2177249,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,0,6291456,6291456,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,6291456]),
  new Uint32Array([0,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,6291456]),
  new Uint32Array([2134435,2134531,2134627,2134723,2134723,2134819,2134819,2134915,2134915,2135011,2105987,2135107,2135203,2135299,2131587,2135395]),
  new Uint32Array([0,0,0,0,0,0,0,6291456,2168673,2169249,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2147906,2147970,2148034,2148098,2148162,2148226,2148290,2148354,2147906,2147970,2148034,2148098,2148162,2148226,2148290,2148354]),
  new Uint32Array([2125219,2125315,2152834,2152898,2125411,2152962,2153026,2125506,2125507,2125603,2153090,2153154,2153218,2153282,2153346,2105348]),
  new Uint32Array([2203393,6291456,2203425,6291456,2203457,6291456,2203489,6291456,6291456,6291456,6291456,2203521,6291456,2181281,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,23068672,6291456,2145538,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,0,6291456]),
  new Uint32Array([2139426,2160834,2160898,2160962,2134242,2161026,2161090,2161154,2161218,2161282,2161346,2161410,2138658,2161474,2161538,2134722]),
  new Uint32Array([2119939,2124930,2125026,2106658,2125218,2128962,2129058,2129154,2129250,2129346,2129442,2108866,2108770,2150466,2150530,2150594]),
  new Uint32Array([2201601,6291456,2201633,6291456,2201665,6291456,2201697,6291456,2201729,6291456,2201761,6291456,2201793,6291456,2201825,6291456]),
  new Uint32Array([2193537,2193569,2193601,2193633,2193665,2193697,2193729,2193761,2193793,2193825,2193857,2193889,2193921,2193953,2193985,2194017]),
  new Uint32Array([6291456,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([0,6291456,6291456,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2190561,6291456,2190593,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2190625,6291456,2190657,6291456,23068672]),
  new Uint32Array([2215905,2215937,2215969,2216001,2216033,2216065,2216097,2216129,2216161,2216193,2216225,2216257,2105441,2216289,2216321,2216353]),
  new Uint32Array([23068672,18884130,23068672,23068672,23068672,6291456,23068672,23068672,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672]),
  new Uint32Array([23068672,23068672,0,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,23068672,23068672,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2191233,2191265,2191297,2191329,2191361,2191393,2191425,2117377,2191457,2191489,2191521,2191553,2191585,2191617,2191649,2117953]),
  new Uint32Array([2132227,2132323,2132419,2132419,2132515,2132515,2132611,2132707,2132707,2132803,2132899,2132899,2132995,2132995,2133091,2133187]),
  new Uint32Array([0,0,0,0,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,6291456,0,0]),
  new Uint32Array([2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,10609889,10610785,10609921,10610817,2222241]),
  new Uint32Array([6291456,6291456,6291456,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,0,0]),
  new Uint32Array([2219969,2157121,2157441,2157505,2157889,2157953,2220001,2158465,2158529,10575617,2156994,2157058,2129923,2130019,2157122,2157186]),
  new Uint32Array([6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,0,0]),
  new Uint32Array([2185249,6291456,2185281,6291456,2185313,6291456,2185345,6291456,2185377,6291456,2185409,6291456,2185441,6291456,2185473,6291456]),
  new Uint32Array([0,0,0,0,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,0,0,23068672,23068672,0,0,23068672,23068672,23068672,6291456,0]),
  new Uint32Array([2183361,6291456,2183393,6291456,2183425,6291456,2183457,6291456,2183489,6291456,2183521,6291456,2183553,6291456,2183585,6291456]),
  new Uint32Array([2192161,2192193,2192225,2192257,2192289,2192321,2192353,2192385,2192417,2192449,2192481,2192513,2192545,2192577,2192609,2192641]),
  new Uint32Array([2212001,2212033,2212065,2212097,2212129,2212161,2212193,2212225,2212257,2212289,2212321,2212353,2212385,2212417,2212449,2207265]),
  new Uint32Array([2249825,2249857,2249889,2249921,2249954,2250018,2250082,2250145,2250177,2250209,2250241,2250274,2250337,2250370,2250433,2250465]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2147905,2147969,2148033,2148097,2148161,2148225,2148289,2148353]),
  new Uint32Array([10485857,6291456,2197217,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,23068672,23068672]),
  new Uint32Array([0,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456]),
  new Uint32Array([2180353,2180385,2144033,2180417,2180449,2180481,2180513,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,10610209,10610465,10610241,10610753,10609857]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,0,0]),
  new Uint32Array([2223842,2223906,2223970,2224034,2224098,2224162,2224226,2224290,2224354,2224418,2224482,2224546,2224610,2224674,2224738,2224802]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,6291456,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456]),
  new Uint32Array([23068672,23068672,23068672,18923650,23068672,23068672,23068672,23068672,0,23068672,23068672,23068672,23068672,18923714,23068672,23068672]),
  new Uint32Array([2126179,2125538,2126275,2126371,2126467,2125634,2126563,2105603,2105604,2125346,2126659,2126755,2126851,2098179,2098181,2098182]),
  new Uint32Array([2227426,2227490,2227554,2227618,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2192353,2240642,2240642,2240705,2240737,2240737,2240769,2240802,2240866,2240929,2240961,2240993,2241025,2241057,2241089,2241121]),
  new Uint32Array([6291456,2170881,2170913,2170945,6291456,2170977,6291456,2171009,2171041,6291456,6291456,6291456,2171073,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2132226,2132514,2163586,2132610,2160386,2133090,2133186,2160450,2160514,2160578,2133570,2106178,2160642,2133858,2160706,2160770]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,10532162,10532226,10532290,10532354,10532418,10532482,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,23068672]),
  new Uint32Array([2098209,2108353,2108193,2108481,2170241,2111713,2105473,2105569,2105601,2112289,2112481,2098305,2108321,0,0,0]),
  new Uint32Array([2209121,2209153,2209185,2209217,2209249,2209281,2209313,2209345,2209377,2209409,2209441,2209473,2207265,2209505,2209537,2209569]),
  new Uint32Array([2189025,6291456,2189057,6291456,2189089,6291456,2189121,6291456,2189153,6291456,2189185,6291456,2189217,6291456,2189249,6291456]),
  new Uint32Array([2173825,2153473,2173857,2173889,2173921,2173953,2173985,2173761,2174017,2174049,2174081,2174113,2174145,2174177,2149057,2233057]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2165764,2140004]),
  new Uint32Array([2215105,6291456,2215137,6291456,6291456,2215169,2215201,6291456,6291456,6291456,2215233,2215265,2215297,2215329,2215361,2215393]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,6291456,6291456,6291456,23068672,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([10505091,10505187,10505283,10505379,10505475,10505571,10505667,10505763,10505859,10505955,10506051,10506147,10506243,10506339,10506435,10506531]),
  new Uint32Array([2229730,2229794,2229858,2229922,2229986,2230050,2230114,2230178,2230242,2230306,2230370,2230434,2230498,2230562,2230626,2230690]),
  new Uint32Array([2105505,2098241,2108353,2108417,2105825,0,2100897,2111905,2105473,2105569,2105601,2112289,2108193,2112481,2112577,2098177]),
  new Uint32Array([6291456,6291456,6291456,6291456,10502115,10502178,10502211,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([0,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456]),
  new Uint32Array([2190305,6291456,2190337,6291456,2190369,6291456,2190401,6291456,2190433,6291456,2190465,6291456,2190497,6291456,2190529,6291456]),
  new Uint32Array([2173793,2173985,2174017,6291456,2173761,2173697,6291456,2174689,6291456,2174017,2174721,6291456,6291456,2174753,2174785,2174817]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2099521,2099105,2120705,2098369,2120801,2103361,2097985,2098433,2121377,2121473,2099169,2099873,2098401,2099393,2152609,2100033]),
  new Uint32Array([2132898,2163842,2163906,2133282,2132034,2131938,2137410,2132802,2132706,2164866,2133282,2160578,2165186,2165186,6291456,6291456]),
  new Uint32Array([10500003,10500099,10500195,10500291,10500387,10500483,10500579,10500675,10500771,10500867,10500963,10501059,10501155,10501251,10501347,10501443]),
  new Uint32Array([2163458,2130978,2131074,2131266,2131362,2163522,2160130,2132066,2131010,2131106,2106018,2131618,2131298,2132034,2131938,2137410]),
  new Uint32Array([2212961,2116993,2212993,2213025,2213057,2213089,2213121,2213153,2213185,2213217,2213249,2209633,2213281,2213313,2213345,2213377]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,23068672,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456]),
  new Uint32Array([2113729,2113825,2113921,2114017,2114113,2114209,2114305,2114401,2114497,2114593,2114689,2114785,2114881,2114977,2115073,2115169]),
  new Uint32Array([2238177,2238209,2238241,2238273,2238305,2238337,2238337,2217537,2238369,2238401,2238433,2238465,2215649,2238497,2238529,2238561]),
  new Uint32Array([2108289,2100865,2113153,2108481,2113345,2113441,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905]),
  new Uint32Array([6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,0,0]),
  new Uint32Array([6291456,0,6291456,2145026,0,6291456,2145090,0,6291456,6291456,0,0,23068672,0,23068672,23068672]),
  new Uint32Array([2099233,2122017,2200673,2098113,2121537,2103201,2200705,2104033,2121857,2121953,2122401,2099649,2099969,2123009,2100129,2100289]),
  new Uint32Array([6291456,23068672,6291456,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,23068672,23068672,0,0,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,0]),
  new Uint32Array([2187681,2187713,2187745,2187777,2187809,2187841,2187873,2187905,2187937,2187969,2188001,2188033,2188065,2188097,2188129,2188161]),
  new Uint32Array([0,10554498,10554562,10554626,10554690,10554754,10554818,10554882,10554946,10555010,10555074,6291456,6291456,0,0,0]),
  new Uint32Array([2235170,2235234,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0]),
  new Uint32Array([2181153,6291456,2188897,6291456,6291456,2188929,6291456,6291456,6291456,6291456,6291456,6291456,2111905,2100865,2188961,2188993]),
  new Uint32Array([2100833,2100897,0,0,2101569,2101697,2101825,2101953,2102081,2102209,10575617,2187041,10502177,10489601,10489697,2112289]),
  new Uint32Array([6291456,2172833,6291456,2172865,2172897,2172929,2172961,6291456,2172993,6291456,2173025,6291456,2173057,6291456,2173089,6291456]),
  new Uint32Array([6291456,0,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,0,0,23068672,6291456,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,2190721]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,23068672,6291456,6291456]),
  new Uint32Array([2184993,6291456,2185025,6291456,2185057,6291456,2185089,6291456,2185121,6291456,2185153,6291456,2185185,6291456,2185217,6291456]),
  new Uint32Array([2115265,2115361,2115457,2115553,2115649,2115745,2115841,2115937,2116033,2116129,2116225,2116321,2150658,2150722,2200225,6291456]),
  new Uint32Array([2168321,6291456,2168353,6291456,2168385,6291456,2168417,6291456,2168449,6291456,2168481,6291456,2168513,6291456,2168545,6291456]),
  new Uint32Array([23068672,23068672,23068672,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,0,6291456,6291456,6291456,6291456,0,0,0,6291456,6291456,0,6291456,0,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,2186625,0,0,6291456,6291456,2186657,2186689,2186721,2173505,0,10496067,10496163,10496259]),
  new Uint32Array([2178785,6291456,2178817,6291456,2178849,6291456,2178881,6291456,2178913,6291456,2178945,6291456,2178977,6291456,2179009,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0]),
  new Uint32Array([2097152,0,0,0,2097152,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456]),
  new Uint32Array([6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([0,0,2197857,2197889,2197921,2197953,2197985,2198017,0,0,2198049,2198081,2198113,2198145,2198177,2198209]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2098209,2167297,2111137,6291456]),
  new Uint32Array([2171393,6291456,2171425,6291456,2171457,6291456,2171489,6291456,2171521,6291456,2171553,6291456,2171585,6291456,2171617,6291456]),
  new Uint32Array([2206753,2206785,2195457,2206817,2206849,2206881,2206913,2197153,2197153,2206945,2117857,2206977,2207009,2207041,2207073,2207105]),
  new Uint32Array([0,0,0,0,0,0,0,23068672,0,0,0,0,2144834,2144898,0,2144962]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,23068672]),
  new Uint32Array([2108193,2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,2098209,0,2105505,2098241]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,2202049,6291456,2202081,6291456,2202113,6291456,2202145,6291456,2202177,6291456,2202209,6291456,2202241,6291456]),
  new Uint32Array([10501155,10501251,10501347,10501443,10501539,10501635,10501731,10501827,10501923,10502019,2141731,2105505,2098177,2155586,2166530,0]),
  new Uint32Array([2102081,2102209,2100833,2100737,2098337,2101441,2101569,2101697,2101825,2101953,2102081,2102209,2100833,2100737,2098337,2101441]),
  new Uint32Array([2146882,2146946,2147010,2147074,2147138,2147202,2147266,2147330,2146882,2146946,2147010,2147074,2147138,2147202,2147266,2147330]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0]),
  new Uint32Array([10502307,10502403,10502499,10502595,10502691,10502787,10502883,10502979,10503075,10503171,10503267,10503363,10503459,10503555,10503651,10503747]),
  new Uint32Array([2179937,2179969,2180001,2180033,2156545,2180065,2156577,2180097,2180129,2180161,2180193,2180225,2180257,2180289,2156737,2180321]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,0,0,0,6291456,0,0,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0]),
  new Uint32Array([2227682,2227746,2227810,2227874,2227938,2228002,2228066,2228130,2228194,2228258,2228322,2228386,2228450,2228514,2228578,2228642]),
  new Uint32Array([2105601,2169121,2108193,2170049,2181025,2181057,2112481,2108321,2108289,2181089,2170497,2100865,2181121,2173601,2173633,2173665]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2180641,6291456,6291456,6291456]),
  new Uint32Array([0,6291456,6291456,6291456,0,6291456,0,6291456,0,0,6291456,6291456,0,6291456,6291456,6291456]),
  new Uint32Array([2178273,6291456,2178305,6291456,2178337,6291456,2178369,6291456,2178401,6291456,2178433,6291456,2178465,6291456,2178497,6291456]),
  new Uint32Array([6291456,6291456,23068672,23068672,23068672,6291456,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,14680064,14680064,14680064,14680064,14680064,14680064]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456]),
  new Uint32Array([2237377,2237409,2236225,2237441,2237473,2217441,2215521,2215553,2217473,2237505,2237537,2209697,2237569,2215585,2237601,2237633]),
  new Uint32Array([2221985,2165601,2165601,2165665,2165665,2222017,2222017,2165729,2165729,2158913,2158913,2158913,2158913,2097281,2097281,2105921]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,0,23068672,23068672,23068672,0,23068672,23068672,23068672,23068672,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2149634,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2176897,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,2176929,6291456,2176961,6291456,2176993,6291456]),
  new Uint32Array([2172641,6291456,2172673,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2172705,2172737,6291456,2172769,2172801,6291456]),
  new Uint32Array([2099173,2104196,2121667,2099395,2121763,2152258,2152322,2098946,2152386,2121859,2121955,2099333,2122051,2104324,2099493,2122147]),
  new Uint32Array([6291456,6291456,6291456,2145794,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,2145858,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,0,0,6291456,0]),
  new Uint32Array([0,2105921,2097729,0,2097377,0,0,2106017,0,2097505,2105889,2097185,2097697,2135777,2097633,2097441]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2239074,2239138,2239201,2239233,2239265,2239297,2239329,2239361,0,2239393,2239425,2239425,2239458,2239521,2239553,2209569]),
  new Uint32Array([14680064,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289,2108193]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,6291456,23068672]),
  new Uint32Array([2108321,2108289,2113153,2098209,2180897,2180929,2180961,2111137,2098241,2108353,2170241,2170273,2180993,2105825,6291456,2105473]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2146114,6291456,6291456,6291456,0,0,0]),
  new Uint32Array([2105921,2105921,2105921,2222049,2222049,2130977,2130977,2130977,2130977,2160065,2160065,2160065,2160065,2097729,2097729,2097729]),
  new Uint32Array([2218145,2214785,2207937,2218177,2218209,2192993,2210113,2212769,2218241,2218273,2216129,2218305,2216161,2218337,2218369,2218401]),
  new Uint32Array([0,0,0,2156546,2156610,2156674,2156738,2156802,0,0,0,0,0,2156866,23068672,2156930]),
  new Uint32Array([23068672,23068672,23068672,0,0,0,0,23068672,23068672,0,0,23068672,23068672,23068672,0,0]),
  new Uint32Array([2213409,2213441,2213473,2213505,2213537,2213569,2213601,2213633,2213665,2195681,2213697,2213729,2213761,2213793,2213825,2213857]),
  new Uint32Array([2100033,2099233,2122017,2200673,2098113,2121537,2103201,2200705,2104033,2121857,2121953,2122401,2099649,2099969,2123009,2100129]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2201857,6291456,2201889,6291456,2201921,6291456,2201953,6291456,2201985,6291456,2202017,6291456,2176193,2176257,23068672,23068672]),
  new Uint32Array([6291456,6291456,23068672,23068672,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2188193,2188225,2188257,2188289,2188321,2188353,2188385,2188417,2188449,2188481,2188513,2188545,2188577,2188609,2188641,0]),
  new Uint32Array([10554529,2221089,0,10502113,10562017,10537921,10538049,2221121,2221153,0,0,0,0,0,0,0]),
  new Uint32Array([2213889,2213921,2213953,2213985,2214017,2214049,2214081,2194177,2214113,2214145,2214177,2214209,2214241,2214273,2214305,2214337]),
  new Uint32Array([2166978,2167042,2099169,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2180545,6291456,6291456,6291456]),
  new Uint32Array([10518915,10519011,10519107,10519203,2162242,2162306,2159554,2162370,2159362,2159618,2105922,2162434,2159746,2162498,2159810,2159874]),
  new Uint32Array([2161730,2161794,2135586,2161858,2161922,2137186,2131810,2160290,2135170,2161986,2137954,2162050,2162114,2162178,10518723,10518819]),
  new Uint32Array([10506627,10506723,10506819,10506915,10507011,10507107,10507203,10507299,10507395,10507491,10507587,10507683,10507779,10507875,10507971,10508067]),
  new Uint32Array([6291456,23068672,23068672,23068672,0,23068672,23068672,0,0,0,0,0,23068672,23068672,23068672,23068672]),
  new Uint32Array([23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0]),
  new Uint32Array([2175873,2175905,2175937,2175969,2176001,2176033,2176065,2176097,2176129,2176161,2176193,2176225,2176257,2176289,2176321,2176353]),
  new Uint32Array([2140006,2140198,2140390,2140582,2140774,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,23068672,23068672,23068672]),
  new Uint32Array([2108193,2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,2098209,2111137,2105505,2098241]),
  new Uint32Array([0,23068672,0,0,0,0,0,0,0,2145154,2145218,2145282,6291456,0,2145346,0]),
  new Uint32Array([0,0,0,0,10531458,10495395,2148545,2143201,2173473,2148865,2173505,0,2173537,0,2173569,2149121]),
  new Uint32Array([10537282,10495683,2148738,2148802,2148866,0,6291456,2148930,2186593,2173473,2148737,2148865,2148802,10495779,10495875,10495971]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2215425,2215457,2215489,2215521,2215553,2215585,2215617,2215649,2215681,2215713,2215745,2215777,2192033,2215809,2215841,2215873]),
  new Uint32Array([2242049,2242081,2242113,2242145,2242177,2242209,2242241,2242273,2215937,2242305,2242338,2242401,2242433,2242465,2242497,2216001]),
  new Uint32Array([10554529,2221089,0,0,10562017,10502113,10538049,10537921,2221185,10489601,10489697,10609889,10609921,2141729,2141793,10610273]),
  new Uint32Array([2141923,2142019,2142115,2142211,2142307,2142403,2142499,2142595,2142691,0,0,0,0,0,0,0]),
  new Uint32Array([0,2221185,2221217,10609857,10609857,10489601,10489697,10609889,10609921,2141729,2141793,2221345,2221377,2221409,2221441,2187105]),
  new Uint32Array([6291456,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,18923970,23068672,23068672,23068672,0,6291456,6291456]),
  new Uint32Array([2183105,6291456,2183137,6291456,2183169,6291456,2183201,6291456,2183233,6291456,2183265,6291456,2183297,6291456,2183329,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0]),
  new Uint32Array([23068672,23068672,23068672,23068672,0,0,0,0,0,0,0,0,6291456,6291456,6291456,6291456]),
  new Uint32Array([2134434,2134818,2097666,2097186,2097474,2097698,2105986,2131586,2132450,2131874,2131778,2135970,2135778,2161602,2136162,2161666]),
  new Uint32Array([2236865,2236897,2236930,2236993,2237025,2235681,2237058,2237121,2237153,2237185,2237217,2217281,2237250,2191233,2237313,2237345]),
  new Uint32Array([2190049,6291456,2190081,6291456,2190113,6291456,2190145,6291456,2190177,6291456,2190209,6291456,2190241,6291456,2190273,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2101922,2102050,2102178,2102306,10498755,10498851,10498947,10499043,10499139,10499235,10499331,10499427,10499523,10489604,10489732,10489860]),
  new Uint32Array([2166914,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,0,0]),
  new Uint32Array([2181601,2170561,2181633,2181665,2170753,2181697,2172897,2170881,2181729,2170913,2172929,2113441,2181761,2181793,2171009,2173761]),
  new Uint32Array([0,2105921,2097729,2106081,0,2097601,2162337,2106017,2133281,2097505,0,2097185,2097697,2135777,2097633,2097441]),
  new Uint32Array([6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,0,0,0,0]),
  new Uint32Array([2248001,2248033,2248066,2248130,2248193,2248226,2248289,2248322,2248385,2248417,2216673,2248450,2248514,2248577,2248610,2248673]),
  new Uint32Array([6291456,6291456,0,0,0,0,0,0,0,6291456,6291456,6291456,6291456,0,0,0]),
  new Uint32Array([2169729,6291456,2169761,6291456,2169793,6291456,2169825,6291456,2169857,2169889,6291456,2169921,6291456,2143329,6291456,2098305]),
  new Uint32Array([2162178,2163202,2163266,2135170,2136226,2161986,2137954,2159426,2159490,2163330,2159554,2163394,2159682,2139522,2136450,2159746]),
  new Uint32Array([2173953,2173985,0,2174017,2174049,2174081,2174113,2174145,2174177,2149057,2174209,2174241,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,4271169,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2174273]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,0,0,0,0,0,0,0,6291456,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,2190785,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2189793,6291456,2189825,6291456,2189857,6291456,2189889,6291456,2189921,6291456,2189953,6291456,2189985,6291456,2190017,6291456]),
  new Uint32Array([2105601,2112289,2108193,2112481,2112577,0,2098305,2108321,2108289,2100865,2113153,2108481,2113345,0,2098209,2111137]),
  new Uint32Array([2172129,6291456,2172161,6291456,2172193,6291456,2172225,6291456,2172257,6291456,2172289,6291456,2172321,6291456,2172353,6291456]),
  new Uint32Array([2214753,6291456,2214785,6291456,6291456,2214817,2214849,2214881,2214913,2214945,2214977,2215009,2215041,2215073,2194401,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,6291456,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([0,0,0,0,6291456,6291456,6291456,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([10610305,10610337,10575617,2221761,10610401,10610433,10502177,0,10610465,10610497,10610529,10610561,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,23068672,0,0,0,0,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2187105,2187137,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2199393,2199425,2199457,2199489,2199521,2199553,2199585,2199617,2199649,2199681,2199713,2199745,2199777,2199809,2199841,0]),
  new Uint32Array([2217249,2217281,2217313,2217345,2217377,2217409,2217441,2217473,2215617,2217505,2217537,2217569,2214753,2217601,2217633,2217665]),
  new Uint32Array([2170273,2170305,6291456,2170337,2170369,6291456,2170401,2170433,2170465,6291456,6291456,6291456,2170497,2170529,6291456,2170561]),
  new Uint32Array([2188673,6291456,2188705,2188737,2188769,6291456,6291456,2188801,6291456,2188833,6291456,2188865,6291456,2180929,2181505,2180897]),
  new Uint32Array([10489988,10490116,10490244,10490372,10490500,10490628,10490756,10490884,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2147393,2147457,2147521,2147585,2147649,2147713,2147777,2147841]),
  new Uint32Array([23068672,23068672,0,23068672,23068672,0,23068672,23068672,23068672,23068672,23068672,0,0,0,0,0]),
  new Uint32Array([2241153,2241185,2241217,2215809,2241250,2241313,2241345,2241377,2217921,2241377,2241409,2215873,2241441,2241473,2241505,2241537]),
  new Uint32Array([23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2220417,2220417,2220449,2220449,2220481,2220481,2220513,2220513,2220545,2220545,2220577,2220577,2220609,2220609,2220641,2220641]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,2144002,0,6291456,6291456,0,0,6291456,6291456,6291456]),
  new Uint32Array([2167105,2167137,2167169,2167201,2167233,2167265,2167297,2167329,2167361,2167393,2167425,2167457,2167489,2167521,2167553,2167585]),
  new Uint32Array([10575521,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289,2108193]),
  new Uint32Array([2234146,2234210,2234274,2234338,2234402,2234466,2234530,2234594,2234658,2234722,2234786,2234850,2234914,2234978,2235042,2235106]),
  new Uint32Array([0,0,0,0,0,0,0,2180577,0,0,0,0,0,2180609,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,0,0,6291456,6291456]),
  new Uint32Array([2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289,2108193,2112481]),
  new Uint32Array([23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2242529,2242561,2242593,2242625,2242657,2242689,2242721,2242753,2207937,2218177,2242785,2242817,2242849,2242882,2242945,2242977]),
  new Uint32Array([2118049,2105345,2118241,2105441,2118433,2118529,2118625,2118721,2118817,2200257,2200289,2191809,2200321,2200353,2200385,2200417]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0]),
  new Uint32Array([2185505,6291456,2185537,6291456,2185569,6291456,2185601,6291456,2185633,6291456,2185665,6291456,2185697,6291456,2185729,6291456]),
  new Uint32Array([2231970,2232034,2232098,2232162,2232226,2232290,2232354,2232418,2232482,2232546,2232610,2232674,2232738,2232802,2232866,2232930]),
  new Uint32Array([2218625,2246402,2246466,2246530,2246594,2246657,2246689,2246689,2218657,2219681,2246721,2246753,2246785,2246818,2246881,2208481]),
  new Uint32Array([2197025,2197057,2197089,2197121,2197153,2197185,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2219137,2216961,2219169,2219201,2219233,2219265,2219297,2217025,2215041,2219329,2217057,2219361,2217089,2219393,2197153,2219426]),
  new Uint32Array([23068672,23068672,23068672,0,0,0,23068672,23068672,23068672,0,23068672,23068672,23068672,23068672,0,0]),
  new Uint32Array([2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713]),
  new Uint32Array([2243522,2243585,2243617,2243649,2243681,2210113,2243713,2243746,2243810,2243874,2243937,2243970,2244033,2244065,2244097,2244129]),
  new Uint32Array([2178017,6291456,2178049,6291456,2178081,6291456,2178113,6291456,2178145,6291456,2178177,6291456,2178209,6291456,2178241,6291456]),
  new Uint32Array([10553858,2165314,10518722,6291456,10518818,0,10518914,2130690,10519010,2130786,10519106,2130882,10519202,2165378,10554050,2165506]),
  new Uint32Array([0,0,2135491,2135587,2135683,2135779,2135875,2135971,2135971,2136067,2136163,2136259,2136355,2136355,2136451,2136547]),
  new Uint32Array([23068672,23068672,23068672,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456]),
  new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,0,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2220033,2220033,2220065,2220065,2220065,2220065,2220097,2220097,2220097,2220097,2220129,2220129,2220129,2220129,2220161,2220161]),
  new Uint32Array([6291456,6291456,6291456,0,0,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,0,23068672,0,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2100897,2100898,2100899,2150018,2100865,2100866,2100867,2100868,2150082,2108481,2109858,2109859,2105569,2105505,2098241,2105601]),
  new Uint32Array([2097217,2097505,2097505,2097505,2097505,2165570,2165570,2165634,2165634,2165698,2165698,2097858,2097858,0,0,2097152]),
  new Uint32Array([23068672,6291456,23068672,23068672,23068672,6291456,6291456,23068672,23068672,6291456,6291456,6291456,6291456,6291456,23068672,23068672]),
  new Uint32Array([23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0]),
  new Uint32Array([10503843,10503939,10504035,10504131,10504227,10504323,10504419,10504515,10504611,10504707,10504803,10504899,10504995,10491140,10491268,0]),
  new Uint32Array([2173697,2173729,2148801,2173761,2143969,2173793,2173825,2153473,2173857,2173889,2173921,2173953,2173985,2173761,2174017,2174049]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2134145,2097153,2134241,2105953,2132705,2130977,2160065,2131297,2162049,2133089,2160577,2133857,2235297,2220769,2235329,2235361]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2222401,2222433,2222465,10531394,2222497,2222529,2222561,0,2222593,2222625,2222657,2222689,2222721,2222753,2222785,0]),
  new Uint32Array([2184481,6291456,2184513,6291456,2184545,6291456,2184577,6291456,2184609,6291456,2184641,6291456,2184673,6291456,2184705,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,23068672,23068672,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2105570,2156034,2126947,2156098,2153666,2127043,2127139,2156162,0,2127235,2156226,2156290,2156354,2156418,2127331,2127427]),
  new Uint32Array([2215905,2207041,2153185,2241569,2241601,2241633,2241665,2241697,2241730,2241793,2241825,2241857,2241889,2241921,2241954,2242017]),
  new Uint32Array([2203777,6291456,2203809,6291456,2203841,6291456,2203873,6291456,2203905,6291456,2173121,2180993,2181249,2203937,2181313,0]),
  new Uint32Array([2168577,6291456,2168609,6291456,2168641,6291456,2168673,6291456,2168705,6291456,2168737,6291456,2168769,6291456,2168801,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456,23068672,23068672,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,0,23068672,23068672,23068672,0,23068672,23068672,23068672,0,0]),
  new Uint32Array([2210113,2195521,2210145,2210177,2210209,2210241,2210273,2210305,2210337,2210369,2210401,2210433,2210465,2210497,2210529,2210561]),
  new Uint32Array([6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0]),
  new Uint32Array([2228706,2228770,2228834,2228898,2228962,2229026,2229090,2229154,2229218,2229282,2229346,2229410,2229474,2229538,2229602,2229666]),
  new Uint32Array([23068672,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,0,0,0,0,0,0,0,0,0,0,0,0,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,18874368,18874368,18874368,0,0]),
  new Uint32Array([2133089,2133281,2133281,2133281,2133281,2160577,2160577,2160577,2160577,2097441,2097441,2097441,2097441,2133857,2133857,2133857]),
  new Uint32Array([6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2173825,2153473,2173857,2173889,2173921,2173953,2173985,2174017,2174017,2174049,2174081,2174113,2174145,2174177,2149057,2233089]),
  new Uint32Array([2178529,6291456,2178561,6291456,2178593,6291456,2178625,6291456,2178657,6291456,2178689,6291456,2178721,6291456,2178753,6291456]),
  new Uint32Array([2221025,2221025,2221057,2221057,2159329,2159329,2159329,2159329,2097217,2097217,2158914,2158914,2158978,2158978,2159042,2159042]),
  new Uint32Array([2208161,2208193,2208225,2208257,2194433,2208289,2208321,2208353,2208385,2208417,2208449,2208481,2208513,2208545,2208577,2208609]),
  new Uint32Array([2169217,6291456,2169249,6291456,2169281,6291456,2169313,6291456,2169345,6291456,2169377,6291456,2169409,6291456,2169441,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456,6291456,6291456,6291456]),
  new Uint32Array([2133187,2133283,2133283,2133379,2133475,2133571,2133667,2133667,2133763,2133859,2133955,2134051,2134147,2134147,2134243,2134339]),
  new Uint32Array([2197697,2114113,2114209,2197729,2197761,2114305,2197793,2114401,2114497,2197825,2114593,2114689,2114785,2114881,2114977,0]),
  new Uint32Array([2193089,2193121,2193153,2193185,2117665,2117569,2193217,2193249,2193281,2193313,2193345,2193377,2193409,2193441,2193473,2193505]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2184225,6291456,2184257,6291456,2184289,6291456,2184321,6291456,2184353,6291456,2184385,6291456,2184417,6291456,2184449,6291456]),
  new Uint32Array([2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,2100833,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2098657,2098049,2200737,2123489,2123681,2200769,2098625,2100321,2098145,2100449,2098017,2098753,2200801,2200833,2200865,0]),
  new Uint32Array([23068672,23068672,23068672,0,0,0,0,0,0,0,0,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,0,0,0,0,0]),
  new Uint32Array([2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,2098209,2111137,0,2098241,2108353,2108417,2105825,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2181153,2105505,2181185,2167617,2180993]),
  new Uint32Array([2160002,2160066,2160130,2160194,2160258,2132066,2131010,2131106,2106018,2131618,2160322,2131298,2132034,2131938,2137410,2132226]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0,0,0,0,6291456]),
  new Uint32Array([2183617,6291456,2183649,6291456,2183681,6291456,2183713,6291456,2183745,6291456,2183777,6291456,2183809,6291456,2183841,6291456]),
  new Uint32Array([0,6291456,6291456,0,6291456,0,0,6291456,6291456,0,6291456,0,0,6291456,0,0]),
  new Uint32Array([2250977,2251009,2251041,2251073,2195009,2251106,2251169,2251201,2251233,2251265,2251297,2251330,2251394,2251457,2251489,2251521]),
  new Uint32Array([2205729,2205761,2205793,2205825,2205857,2205889,2205921,2205953,2205985,2206017,2206049,2206081,2206113,2206145,2206177,2206209]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2143170,2168993,6291456,2169025,6291456,2169057,6291456,2169089,6291456,2143234,2169121,6291456,2169153,6291456,2169185,6291456]),
  new Uint32Array([23068672,23068672,2190689,6291456,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2248706,2248769,2248801,2248833,2248865,2248897,2248929,2248962,2249026,2249090,2249154,2240705,2249217,2249249,2249281,2249313]),
  new Uint32Array([10485857,6291456,6291456,6291456,6291456,6291456,6291456,6291456,10495394,6291456,2098209,6291456,6291456,2097152,6291456,10531394]),
  new Uint32Array([0,6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,0]),
  new Uint32Array([14680064,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2173985,2173953,2148481,2173601,2173633,2173665,2173697,2173729,2148801,2173761,2143969,2173793,2173825,2153473,2173857,2173889]),
  new Uint32Array([6291456,2186977,6291456,6291456,6291456,6291456,6291456,10537858,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2209601,2209633,2209665,2209697,2209729,2209761,2209793,2209825,2209857,2209889,2209921,2209953,2209985,2210017,2210049,2210081]),
  new Uint32Array([10501539,10501635,10501731,10501827,10501923,10502019,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905]),
  new Uint32Array([2173697,2173729,2148801,2173761,2143969,2173793,2173825,2153473,2173857,2173889,2173921,2173953,2173985,2174017,2174017,2174049]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,0,0]),
  new Uint32Array([6291456,6291456,23068672,23068672,23068672,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2194561,2194593,2194625,2119777,2119873,2194657,2194689,2194721,2194753,2194785,2194817,2194849,2194881,2194913,2194945,2194977]),
  new Uint32Array([2113153,2108481,2113345,2113441,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569]),
  new Uint32Array([2222818,2222882,2222946,2223010,2223074,2223138,2223202,2223266,2223330,2223394,2223458,2223522,2223586,2223650,2223714,2223778]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672]),
  new Uint32Array([0,2179553,2179585,2179617,2179649,2144001,2179681,2179713,2179745,2179777,2179809,2156705,2179841,2156833,2179873,2179905]),
  new Uint32Array([6291456,23068672,6291456,2145602,23068672,23068672,23068672,23068672,23068672,23068672,0,23068672,23068672,6291456,0,0]),
  new Uint32Array([2196513,2196545,2196577,2196609,2196641,2196673,2196705,2196737,2196769,2196801,2196833,2196865,2196897,2196929,2196961,2196993]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2177281,6291456,2177313,6291456,2177345,6291456,2177377,6291456,2177409,6291456,2177441,6291456,2177473,6291456,2177505,6291456]),
  new Uint32Array([2187137,2221473,2221505,2221537,2221569,6291456,6291456,10610209,10610241,10537986,10537986,10537986,10537986,10609857,10609857,10609857]),
  new Uint32Array([2243009,2243041,2216033,2243074,2243137,2243169,2243201,2219617,2243233,2243265,2243297,2243329,2243362,2243425,2243457,2243489]),
  new Uint32Array([10485857,10485857,10485857,10485857,10485857,10485857,10485857,10485857,10485857,10485857,10485857,2097152,4194304,4194304,0,0]),
  new Uint32Array([2143042,6291456,2143106,2143106,2168833,6291456,2168865,6291456,6291456,2168897,6291456,2168929,6291456,2168961,6291456,2143170]),
  new Uint32Array([6291456,6291456,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2204193,2204225,2204257,2204289,2204321,2204353,2204385,2204417,2204449,2204481,2204513,2204545,2204577,2204609,2204641,2204673]),
  new Uint32Array([2202753,6291456,2202785,6291456,2202817,6291456,2202849,6291456,2202881,6291456,2202913,6291456,2202945,6291456,2202977,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289,2108193,2112481,2112577,2098177,2098305,2108321]),
  new Uint32Array([2147394,2147458,2147522,2147586,2147650,2147714,2147778,2147842,2147394,2147458,2147522,2147586,2147650,2147714,2147778,2147842]),
  new Uint32Array([2253313,2253346,2253409,2253441,2253473,2253505,2253537,2253569,2253601,2253634,2219393,2253697,2253729,2253761,2253793,2253825]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,6291456,6291456]),
  new Uint32Array([2162562,2162626,2131362,2162690,2159938,2160002,2162754,2162818,2160130,2162882,2160194,2160258,2160834,2160898,2161026,2161090]),
  new Uint32Array([2175361,2175393,2175425,2175457,2175489,2175521,2175553,2175585,2175617,2175649,2175681,2175713,2175745,2175777,2175809,2175841]),
  new Uint32Array([2253858,2253921,2253954,2254018,2254082,2196737,2254145,2196865,2254177,2254209,2254241,2254273,2197025,2254306,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2202113,2204129,2188705,2204161]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,0,6291456,6291456,6291456,6291456,0,0]),
  new Uint32Array([2173985,2174017,2174017,2174049,2174081,2174113,2174145,2174177,2149057,2233089,2173697,2173761,2173793,2174113,2173985,2173953]),
  new Uint32Array([2101569,2101697,2101825,2101953,2102081,2102209,2100833,2100737,2098337,2101441,2101569,2101697,2101825,2101953,2102081,2102209]),
  new Uint32Array([2108289,2100865,2113153,2108481,2113345,2113441,2098209,2111137,2105505,2098241,0,2108417,0,2111713,2100897,2111905]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,0,0,0,0,0]),
  new Uint32Array([2175425,2175489,2175809,2175905,2175937,2175937,2176193,2176417,2180865,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,2143298,2143298,2143298,2143362,2143362,2143362,2143426,2143426,2143426,2171105,6291456,2171137]),
  new Uint32Array([2120162,2120258,2151618,2151682,2151746,2151810,2151874,2151938,2152002,2120035,2120131,2120227,2152066,2120323,2152130,2120419]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,0,0,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2195361,2142433,2236065,2236097,2236129,2236161,2118241,2117473,2236193,2236225,2236257,2236289,0,0,0,0]),
  new Uint32Array([2189281,6291456,2189313,6291456,2189345,6291456,2189377,6291456,2189409,6291456,2189441,6291456,2189473,6291456,2189505,6291456]),
  new Uint32Array([6291456,6291456,2145922,6291456,6291456,6291456,6291456,2145986,6291456,6291456,6291456,6291456,2146050,6291456,6291456,6291456]),
  new Uint32Array([2100833,2100737,2098337,2101441,2101569,2101697,2101825,2101953,2102081,2102209,10502113,10562017,10610401,10502177,10610433,10538049]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,2186401,0,2186433,0,2186465,0,2186497]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,23068672,23068672,23068672]),
  new Uint32Array([0,0,2198241,2198273,2198305,2198337,2198369,2198401,0,0,2198433,2198465,2198497,0,0,0]),
  new Uint32Array([6291456,0,6291456,6291456,6291456,6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,0,6291456,0,23068672,23068672,23068672,23068672,23068672,23068672,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,0,0,23068672,6291456,23068672,23068672]),
  new Uint32Array([0,2105921,2097729,0,2097377,0,0,2106017,2133281,2097505,2105889,0,2097697,2135777,2097633,2097441]),
  new Uint32Array([2197889,2197921,2197953,2197985,2198017,2198049,2198081,2198113,2198145,2198177,2198209,2198241,2198273,2198305,2198337,2198369]),
  new Uint32Array([2132514,2132610,2160386,2133090,2133186,2160450,2160514,2133282,2160578,2133570,2106178,2160642,2133858,2160706,2160770,2134146]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,23068672,23068672,0,0,0,0,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,23068672,23068672,6291456,23068672,23068672,6291456,23068672,0,0,0,0,0,0,0,0]),
  new Uint32Array([2184737,6291456,2184769,6291456,2184801,6291456,2184833,6291456,2184865,6291456,2184897,6291456,2184929,6291456,2184961,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,0,6291456,6291456,6291456,6291456,0,6291456]),
  new Uint32Array([6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,6291456,23068672,23068672,23068672,6291456,23068672,23068672,23068672,23068672,23068672,0,0]),
  new Uint32Array([6291456,6291456,6291456,2186753,6291456,6291456,6291456,6291456,2186785,2186817,2186849,2173569,2186881,10496355,10495395,10575521]),
  new Uint32Array([0,0,2097729,0,0,0,0,2106017,0,2097505,0,2097185,0,2135777,2097633,2097441]),
  new Uint32Array([2189537,6291456,2189569,6291456,2189601,6291456,2189633,6291456,2189665,6291456,2189697,6291456,2189729,6291456,2189761,6291456]),
  new Uint32Array([2202497,6291456,2202529,6291456,2202561,6291456,2202593,6291456,2202625,6291456,2202657,6291456,2202689,6291456,2202721,6291456]),
  new Uint32Array([2245217,2218369,2245249,2245282,2245345,2245377,2245410,2245474,2245537,2245569,2245601,2245633,2245665,2245665,2245697,2245729]),
  new Uint32Array([6291456,0,23068672,23068672,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,0,0,0,0,0,0,23068672,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,23068672,6291456,23068672,6291456,23068672,6291456,6291456,6291456,6291456,23068672,23068672]),
  new Uint32Array([0,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2097281,2105921,2097729,2106081,2097377,2097601,2162337,2106017,2133281,2097505,0,2097185,2097697,2135777,2097633,2097441]),
  new Uint32Array([2176641,6291456,2176673,6291456,2176705,6291456,2176737,6291456,2176769,6291456,2176801,6291456,2176833,6291456,2176865,6291456]),
  new Uint32Array([2174145,2174177,2149057,2233089,2173697,2173761,2173793,2174113,2173985,2173953,2174369,2174369,0,0,2100833,2100737]),
  new Uint32Array([2116513,2190817,2190849,2190881,2190913,2190945,2116609,2190977,2191009,2191041,2191073,2117185,2191105,2191137,2191169,2191201]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,6291456,6291456,6291456]),
  new Uint32Array([0,0,0,0,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456]),
  new Uint32Array([2167617,2167649,2167681,2167713,2167745,2167777,2167809,6291456,2167841,2167873,2167905,2167937,2167969,2168001,2168033,4240130]),
  new Uint32Array([2165122,2163970,2164034,2164098,2164162,2164226,2164290,2164354,2164418,2164482,2164546,2133122,2134562,2132162,2132834,2136866]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,0,2186209,2186241,2186273,2186305,2186337,2186369,0,0]),
  new Uint32Array([2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,14680064,14680064,14680064,14680064,14680064]),
  new Uint32Array([0,0,23068672,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,6291456,6291456]),
  new Uint32Array([0,10537921,10610689,10610273,10610497,10610529,10610305,10610721,10489601,10489697,10610337,10575617,10554529,2221761,2197217,10496577]),
  new Uint32Array([2105473,2105569,2105601,2112289,0,2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441]),
  new Uint32Array([2100897,2111905,2105473,2105569,2105601,2112289,2108193,2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481]),
  new Uint32Array([2125346,2153410,2153474,2127394,2153538,2153602,2153666,2153730,2105507,2105476,2153794,2153858,2153922,2153986,2154050,2105794]),
  new Uint32Array([2200449,2119681,2200481,2153313,2199873,2199905,2199937,2200513,2200545,2200577,2200609,2119105,2119201,2119297,2119393,2119489]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2175777,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2222273,2197217,2221473,2221505,2221089,2222305,2200865,2099681,2104481,2222337,2099905,2120737,2222369,2103713,2100225,2098785]),
  new Uint32Array([2201377,6291456,2201409,6291456,2201441,6291456,2201473,6291456,2201505,6291456,2201537,6291456,2201569,6291456,6291456,23068672]),
  new Uint32Array([2174081,2174113,2174145,2174177,2149057,2233057,2148481,2173601,2173633,2173665,2173697,2173729,2148801,2173761,2143969,2173793]),
  new Uint32Array([2200897,6291456,2200929,6291456,2200961,6291456,2200993,6291456,2201025,6291456,2180865,6291456,2201057,6291456,2201089,6291456]),
  new Uint32Array([0,0,0,0,0,23068672,23068672,0,6291456,6291456,6291456,0,0,0,0,0]),
  new Uint32Array([2161154,2161410,2138658,2161474,2161538,2097666,2097186,2097474,2162946,2132450,2163010,2163074,2136162,2163138,2161666,2161730]),
  new Uint32Array([2148481,2173601,2173633,2173665,2173697,2173729,2148801,2173761,2143969,2173793,2173825,2153473,2173857,2173889,2173921,2173953]),
  new Uint32Array([0,0,0,0,0,0,23068672,23068672,0,0,0,0,2145410,2145474,0,6291456]),
  new Uint32Array([2244161,2216065,2212769,2244193,2244225,2244257,2244290,2244353,2244385,2244417,2244449,2218273,2244481,2244514,2244577,2244609]),
  new Uint32Array([2125730,2125699,2125795,2125891,2125987,2154114,2154178,2154242,2154306,2154370,2154434,2154498,2126082,2126178,2126274,2126083]),
  new Uint32Array([2237665,2237697,2237697,2237697,2237730,2237793,2237825,2237857,2237890,2237953,2237985,2238017,2238049,2238081,2238113,2238145]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2150146,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,0,0,23068672,23068672,0,0,23068672,23068672,23068672,0,0]),
  new Uint32Array([2214369,2238593,2238625,2238657,2238689,2238721,2238753,2238785,2238817,2238850,2238913,2238945,2238977,2235457,2239009,2239041]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0]),
  new Uint32Array([2252066,2252130,2252193,2252225,2252257,2252290,2252353,2252385,2252417,2252449,2252481,2252513,2252545,2252578,2252641,2252673]),
  new Uint32Array([2197697,2114113,2114209,2197729,2197761,2114305,2197793,2114401,2114497,2197825,2114593,2114689,2114785,2114881,2114977,2197857]),
  new Uint32Array([2224866,2224930,2224994,2225058,2225122,2225186,2225250,2225314,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2219490,2219554,2219617,2219649,2219681,2219714,2219778,2219842,2219905,2219937,0,0,0,0,0,0]),
  new Uint32Array([6291456,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456]),
  new Uint32Array([2113345,2113441,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289]),
  new Uint32Array([2174081,2174113,2174145,2174177,2149057,2233089,2173697,2173761,2173793,2174113,2173985,2173953,2148481,2173601,2173633,2173665]),
  new Uint32Array([2220161,2220161,2220193,2220193,2220193,2220193,2220225,2220225,2220225,2220225,2220257,2220257,2220257,2220257,2220289,2220289]),
  new Uint32Array([2192673,2192705,2192737,2192769,2192801,2192833,2192865,2118049,2192897,2117473,2117761,2192929,2192961,2192993,2193025,2193057]),
  new Uint32Array([2179297,6291456,2179329,6291456,2179361,6291456,2179393,6291456,2179425,6291456,2179457,6291456,2179489,6291456,2179521,6291456]),
  new Uint32Array([6291456,6291456,6291456,23068672,6291456,6291456,6291456,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2235745,2235777,2193633,2235809,2235841,2235873,2235905,2235937,2235969,2116513,2116705,2236001,2200513,2199905,2200545,2236033]),
  new Uint32Array([2113153,2108481,2113345,2113441,2232993,2233025,0,0,2148481,2173601,2173633,2173665,2173697,2173729,2148801,2173761]),
  new Uint32Array([2170593,6291456,2170625,6291456,2170657,6291456,2170689,2170721,6291456,2170753,6291456,6291456,2170785,6291456,2170817,2170849]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2166786,2166850,0,0,0,0]),
  new Uint32Array([23068672,6291456,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456]),
  new Uint32Array([2100833,2100737,2098337,2101441,2101569,2101697,2101825,2101953,2102081,2102209,10575617,2187041,10502177,10489601,10489697,0]),
  new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2134562,2132162,2132834,2136866,2136482,2164610,2164674,2164738,2164802,2132802,2132706,2164866,2132898,2164930,2164994,2165058]),
  new Uint32Array([6291456,6291456,2098337,2101441,10531458,2153473,6291456,6291456,10531522,2100737,2108193,6291456,2106499,2106595,2106691,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2233122,2233186,2233250,2233314,2233378,2233442,2233506,2233570,2233634,2233698,2233762,2233826,2233890,2233954,2234018,2234082]),
  new Uint32Array([23068672,6291456,23068672,23068672,23068672,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2205217,2205249,2205281,2205313,2205345,2205377,2205409,2205441,2205473,2205505,2205537,2205569,2205601,2205633,2205665,2205697]),
  new Uint32Array([6291456,0,6291456,0,0,0,6291456,6291456,6291456,6291456,0,0,23068672,6291456,23068672,23068672]),
  new Uint32Array([2173601,2173761,2174081,2173569,2174241,2174113,2173953,6291456,2174305,6291456,2174337,6291456,2174369,6291456,2174401,6291456]),
  new Uint32Array([6291456,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456]),
  new Uint32Array([2152450,2152514,2099653,2104452,2099813,2122243,2099973,2152578,2122339,2122435,2122531,2122627,2122723,2104580,2122819,2152642]),
  new Uint32Array([2236385,2236417,2236449,2236482,2236545,2215425,2236577,2236609,2236641,2236673,2215457,2236705,2236737,2236770,2215489,2236833]),
  new Uint32Array([2163394,2159746,2163458,2131362,2163522,2160130,2163778,2132226,2163842,2132898,2163906,2161410,2138658,2097666,2136162,2163650]),
  new Uint32Array([2218721,2246913,2246946,2216385,2247010,2247074,2215009,2247137,2247169,2216481,2247201,2247233,2247266,2247330,2247330,0]),
  new Uint32Array([2129730,2129762,2129858,2129731,2129827,2156482,2156482,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,0,0,0,0,0,6291456,0,0]),
  new Uint32Array([2203969,2204001,2181377,2204033,2204065,6291456,2204097,6291456,0,0,0,0,0,0,0,0]),
  new Uint32Array([2169473,6291456,2169505,6291456,2169537,6291456,2169569,6291456,2169601,6291456,2169633,6291456,2169665,6291456,2169697,6291456]),
  new Uint32Array([2141542,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2220801,2220801,2220801,2220801,2220833,2220833,2220865,2220865,2220865,2220865,2220897,2220897,2220897,2220897,2139873,2139873]),
  new Uint32Array([0,0,0,0,0,23068672,23068672,0,0,0,0,0,0,0,6291456,0]),
  new Uint32Array([2214849,2218433,2218465,2218497,2218529,2218561,2214881,2218593,2218625,2218657,2218689,2218721,2218753,2216545,2218785,2218817]),
  new Uint32Array([23068672,23068672,23068672,23068672,0,0,0,0,0,0,0,0,0,0,0,6291456]),
  new Uint32Array([2136482,2164610,2164674,2164738,2164802,2132802,2132706,2164866,2132898,2164930,2164994,2165058,2165122,2132802,2132706,2164866]),
  new Uint32Array([2207649,2207681,2207713,2207745,2207777,2207809,2207841,2207873,2207905,2207937,2207969,2208001,2208033,2208065,2208097,2208129]),
  new Uint32Array([2123683,2105092,2152706,2123779,2105220,2152770,2100453,2098755,2123906,2124002,2124098,2124194,2124290,2124386,2124482,2124578]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,0,0,6291456,0,0,0,0,0,0,0,10485857]),
  new Uint32Array([6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([10508163,10508259,10508355,10508451,2200129,2200161,2192737,2200193,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2203553,6291456,2203585,6291456,6291456,6291456,2203617,6291456,2203649,6291456,2203681,6291456,2203713,6291456,2203745,6291456]),
  new Uint32Array([18884449,18884065,23068672,18884417,18884034,18921185,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,18874368]),
  new Uint32Array([2247393,2247426,2247489,2247521,2247553,2247586,2247649,2247681,2247713,2247745,2247777,2247810,2247873,2247905,2247937,2247969]),
  new Uint32Array([6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,23068672]),
  new Uint32Array([2134145,2097153,2134241,0,2132705,2130977,2160065,2131297,0,2133089,2160577,2133857,2235297,0,2235329,0]),
  new Uint32Array([2182593,6291456,2182625,6291456,2182657,6291456,2182689,6291456,2182721,6291456,2182753,6291456,2182785,6291456,2182817,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2102402,2102403,6291456,2110050]),
  new Uint32Array([2149890,2108323,2149954,6291456,2113441,6291456,2149057,6291456,2113441,6291456,2105473,2167265,2111137,2105505,6291456,2108353]),
  new Uint32Array([2219105,2219137,2195233,2251554,2251617,2251649,2251681,2251713,2251746,2251810,2251873,2251905,2251937,2251970,2252033,2219169]),
  new Uint32Array([2203009,6291456,2203041,6291456,2203073,6291456,2203105,6291456,2203137,6291456,2203169,6291456,2203201,6291456,2203233,6291456]),
  new Uint32Array([2128195,2128291,2128387,2128483,2128579,2128675,2128771,2128867,2128963,2129059,2129155,2129251,2129347,2129443,2129539,2129635]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2140964,2141156,2140966,2141158,2141350]),
  new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2225378,2225442,2225506,2225570,2225634,2225698,2225762,2225826,2225890,2225954,2226018,2226082,2226146,2226210,2226274,2226338]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,2098209,2111137,2105505,2098241,2108353,2108417]),
  new Uint32Array([2108353,2108417,0,2105601,2108193,2157121,2157313,2157377,2157441,2100897,6291456,2108419,2173953,2173633,2173633,2173953]),
  new Uint32Array([2111713,2173121,2111905,2098177,2173153,2173185,2173217,2113153,2113345,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,2190753]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,2197249,6291456,2117377,2197281,2197313,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,0,0,0,0,0,0,23068672,0,0,0,0,0,6291456,6291456,6291456]),
  new Uint32Array([2098337,2101441,2101569,2101697,2101825,2101953,2102081,2102209,2100833,2100737,2098337,2101441,2101569,2101697,2101825,2101953]),
  new Uint32Array([23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0]),
  new Uint32Array([0,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,23068672,23068672,23068672]),
  new Uint32Array([2173281,6291456,2173313,6291456,2173345,6291456,2173377,6291456,0,0,10532546,6291456,6291456,6291456,10562017,2173441]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,0,0]),
  new Uint32Array([23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2159426,2159490,2159554,2159362,2159618,2159682,2139522,2136450,2159746,2159810,2159874,2130978,2131074,2131266,2131362,2159938]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2203233,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2203265,6291456,2203297,6291456,2203329,2203361,6291456]),
  new Uint32Array([6291456,6291456,2148418,2148482,2148546,0,6291456,2148610,2186529,2186561,2148417,2148545,2148482,10495778,2143969,10495778]),
  new Uint32Array([2134146,2139426,2160962,2134242,2161218,2161282,2161346,2161410,2138658,2134722,2134434,2134818,2097666,2097346,2097698,2105986]),
  new Uint32Array([2198881,2198913,2198945,2198977,2199009,2199041,2199073,2199105,2199137,2199169,2199201,2199233,2199265,2199297,2199329,2199361]),
  new Uint32Array([0,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456]),
  new Uint32Array([10610561,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289,2108193]),
  new Uint32Array([2183873,6291456,2183905,6291456,2183937,6291456,2183969,6291456,2184001,6291456,2184033,6291456,2184065,6291456,2184097,6291456]),
  new Uint32Array([2244642,2244706,2244769,2244801,2218305,2244833,2244865,2244897,2244929,2244961,2244993,2245026,2245089,2245122,2245185,0]),
  new Uint32Array([6291456,6291456,2116513,2116609,2116705,2116801,2199873,2199905,2199937,2199969,2190913,2200001,2200033,2200065,2200097,2191009]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,0,2180673,2180705,2180737,2180769,2180801,2180833,0,0]),
  new Uint32Array([2098081,2099521,2099105,2120705,2098369,2120801,2103361,2097985,2098433,2121377,2121473,2099169,2099873,2098401,2099393,2152609]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2150402]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,2145666,2145730,6291456,6291456]),
  new Uint32Array([2173921,2173953,2173985,2173761,2174017,2174049,2174081,2174113,2174145,2174177,2149057,2233057,2148481,2173601,2173633,2173665]),
  new Uint32Array([2187073,6291456,6291456,6291456,6291456,2098241,2098241,2108353,2100897,2111905,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2102404,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,2100612,6291456,6291456,6291456,6291456,6291456,6291456,6291456,10485857]),
  new Uint32Array([2149057,2233057,2148481,2173601,2173633,2173665,2173697,2173729,2148801,2173761,2143969,2173793,2173825,2153473,2173857,2173889]),
  new Uint32Array([2217697,2217729,2217761,2217793,2217825,2217857,2217889,2217921,2217953,2215873,2217985,2215905,2218017,2218049,2218081,2218113]),
  new Uint32Array([2211233,2218849,2216673,2218881,2218913,2218945,2218977,2219009,2216833,2219041,2215137,2219073,2216865,2209505,2219105,2216897]),
  new Uint32Array([2240097,2240129,2240161,2240193,2240225,2240257,2240289,2240321,2240353,2240386,2240449,2240481,2240513,2240545,2207905,2240578]),
  new Uint32Array([6291456,6291456,2202273,6291456,2202305,6291456,2202337,6291456,2202369,6291456,2202401,6291456,2202433,6291456,2202465,6291456]),
  new Uint32Array([0,23068672,23068672,18923394,23068672,18923458,18923522,18884099,18923586,18884195,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2201121,6291456,2201153,6291456,2201185,6291456,2201217,6291456,2201249,6291456,2201281,6291456,2201313,6291456,2201345,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,6291456,6291456]),
  new Uint32Array([2211041,2211073,2211105,2211137,2211169,2211201,2211233,2211265,2211297,2211329,2211361,2211393,2211425,2211457,2211489,2211521]),
  new Uint32Array([2181825,6291456,2181857,6291456,2181889,6291456,2181921,6291456,2181953,6291456,2181985,6291456,2182017,6291456,2182049,6291456]),
  new Uint32Array([2162337,2097633,2097633,2097633,2097633,2132705,2132705,2132705,2132705,2097153,2097153,2097153,2097153,2133089,2133089,2133089]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,2148545,6291456,2173473,6291456,2148865,6291456,2173505,6291456,2173537,6291456,2173569,6291456,2149121,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456,0,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0]),
  new Uint32Array([2148801,2173761,2143969,2173793,2173825,2153473,2173857,2173889,2173921,2173953,2173985,2174017,2174017,2174049,2174081,2174113]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2207137,2207169,2207201,2207233,2207265,2207297,2207329,2207361,2207393,2207425,2207457,2207489,2207521,2207553,2207585,2207617]),
  new Uint32Array([6291456,6291456,23068672,23068672,23068672,6291456,6291456,0,23068672,23068672,0,0,0,0,0,0]),
  new Uint32Array([2198401,2198433,2198465,2198497,0,2198529,2198561,2198593,2198625,2198657,2198689,2198721,2198753,2198785,2198817,2198849]),
  new Uint32Array([2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289,2108193,2112481,2112577,2098177]),
  new Uint32Array([23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,0,0]),
  new Uint32Array([2216385,2118721,2216417,2216449,2216481,2216513,2216545,2211233,2216577,2216609,2216641,2216673,2216705,2216737,2216737,2216769]),
  new Uint32Array([2216801,2216833,2216865,2216897,2216929,2216961,2216993,2215169,2217025,2217057,2217089,2217121,2217154,2217217,0,0]),
  new Uint32Array([2210593,2191809,2210625,2210657,2210689,2210721,2210753,2210785,2210817,2210849,2191297,2210881,2210913,2210945,2210977,2211009]),
  new Uint32Array([0,0,2105825,0,0,2111905,2105473,0,0,2112289,2108193,2112481,2112577,0,2098305,2108321]),
  new Uint32Array([0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([0,2097153,2134241,0,2132705,0,0,2131297,0,2133089,0,2133857,0,2220769,0,2235361]),
  new Uint32Array([14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,6291456,6291456,14680064]),
  new Uint32Array([23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0]),
  new Uint32Array([2171873,6291456,2171905,6291456,2171937,6291456,2171969,6291456,2172001,6291456,2172033,6291456,2172065,6291456,2172097,6291456]),
  new Uint32Array([2220929,2220929,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2133857,2134145,2134145,2134145,2134145,2134241,2134241,2134241,2134241,2105889,2105889,2105889,2105889,2097185,2097185,2097185]),
  new Uint32Array([2173697,2173761,2173793,2174113,2173985,2173953,2148481,2173601,2173633,2173665,2173697,2173729,2148801,2173761,2143969,2173793]),
  new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,0,10499619,10499715,10499811,10499907]),
  new Uint32Array([0,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,0,0,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,0,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,0,23068672,23068672,23068672,0,23068672,23068672,23068672,23068672,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,6291456,23068672,23068672]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,2144322,2144386,2144450,2144514,2144578,2144642,2144706,2144770]),
  new Uint32Array([23068672,23068672,23068672,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456]),
  new Uint32Array([2113153,2108481,2113345,2113441,2098209,2111137,0,2098241,2108353,2108417,2105825,0,0,2111905,2105473,2105569]),
  new Uint32Array([2236321,2236353,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2152194,2121283,2103684,2103812,2097986,2098533,2097990,2098693,2098595,2098853,2099013,2103940,2121379,2121475,2121571,2104068]),
  new Uint32Array([2206241,2206273,2206305,2206337,2206369,2206401,2206433,2206465,2206497,2206529,2206561,2206593,2206625,2206657,2206689,2206721]),
  new Uint32Array([6291456,6291456,6291456,6291456,16777216,16777216,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,23068672,23068672,10538818,10538882,6291456,6291456,2150338]),
  new Uint32Array([6291456,6291456,6291456,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2214369,2214401,2214433,2214465,2214497,2214529,2214561,2214593,2194977,2214625,2195073,2214657,2214689,2214721,6291456,6291456]),
  new Uint32Array([2097152,2097152,2097152,2097152,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2182081,6291456,2182113,6291456,2182145,6291456,2182177,6291456,2182209,6291456,2182241,6291456,2182273,6291456,2182305,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2146881,2146945,2147009,2147073,2147137,2147201,2147265,2147329]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456,23068672,23068672]),
  new Uint32Array([0,0,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2122915,2123011,2123107,2104708,2123203,2123299,2123395,2100133,2104836,2100290,2100293,2104962,2104964,2098052,2123491,2123587]),
  new Uint32Array([23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456]),
  new Uint32Array([6291456,2171169,6291456,2171201,6291456,2171233,6291456,2171265,6291456,2171297,6291456,2171329,6291456,6291456,2171361,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([0,0,2148994,2149058,2149122,0,6291456,2149186,2186945,2173537,2148993,2149121,2149058,10531458,10496066,0]),
  new Uint32Array([2195009,2195041,2195073,2195105,2195137,2195169,2195201,2195233,2195265,2195297,2195329,2195361,2195393,2195425,2195457,2195489]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,0,0,6291456,6291456]),
  new Uint32Array([2182849,6291456,2182881,6291456,2182913,6291456,2182945,6291456,2182977,6291456,2183009,6291456,2183041,6291456,2183073,6291456]),
  new Uint32Array([2211553,2210081,2211585,2211617,2211649,2211681,2211713,2211745,2211777,2211809,2209569,2211841,2211873,2211905,2211937,2211969]),
  new Uint32Array([2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,2166594,2127298,2166658,2142978,2141827,2166722]),
  new Uint32Array([2173985,2173761,2174017,2174049,2174081,2174113,2174145,2174177,2149057,2233057,2148481,2173601,2173633,2173665,2173697,2173729]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,0,0,2185761,2185793,2185825,2185857,2185889,2185921,0,0]),
  new Uint32Array([6291456,2148481,2173601,2173633,2173665,2173697,2173729,2148801,2173761,2143969,2173793,2173825,2153473,2173857,2173889,2173921]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,6291456]),
  new Uint32Array([0,0,0,2220961,2220961,2220961,2220961,2144193,2144193,2159201,2159201,2159265,2159265,2144194,2220993,2220993]),
  new Uint32Array([2192641,2235393,2235425,2152257,2116609,2235457,2235489,2200065,2235521,2235553,2235585,2212449,2235617,2235649,2235681,2235713]),
  new Uint32Array([2194049,2194081,2194113,2194145,2194177,2194209,2194241,2194273,2194305,2194337,2194369,2194401,2194433,2194465,2194497,2194529]),
  new Uint32Array([2196673,2208641,2208673,2208705,2208737,2208769,2208801,2208833,2208865,2208897,2208929,2208961,2208993,2209025,2209057,2209089]),
  new Uint32Array([2191681,2191713,2191745,2191777,2153281,2191809,2191841,2191873,2191905,2191937,2191969,2192001,2192033,2192065,2192097,2192129]),
  new Uint32Array([2230946,2231010,2231074,2231138,2231202,2231266,2231330,2231394,2231458,2231522,2231586,2231650,2231714,2231778,2231842,2231906]),
  new Uint32Array([14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064,14680064]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,2185953,2185985,2186017,2186049,2186081,2186113,2186145,2186177]),
  new Uint32Array([2139811,2139907,2097284,2105860,2105988,2106116,2106244,2097444,2097604,2097155,10485778,10486344,2106372,6291456,0,0]),
  new Uint32Array([2110051,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([0,0,0,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2172385,6291456,2172417,6291456,2172449,6291456,2172481,6291456,2172513,6291456,2172545,6291456,2172577,6291456,2172609,6291456]),
  new Uint32Array([0,0,23068672,23068672,6291456,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2249345,2249377,2249409,2249441,2249473,2249505,2249537,2249570,2210209,2249633,2249665,2249697,2249729,2249761,2249793,2216769]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,6291456,6291456,6291456,6291456]),
  new Uint32Array([2187169,2187201,2187233,2187265,2187297,2187329,2187361,2187393,2187425,2187457,2187489,2187521,2187553,2187585,2187617,2187649]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([0,0,0,6291456,6291456,0,0,0,6291456,6291456,6291456,0,0,0,6291456,6291456]),
  new Uint32Array([2182337,6291456,2182369,6291456,2182401,6291456,2182433,6291456,2182465,6291456,2182497,6291456,2182529,6291456,2182561,6291456]),
  new Uint32Array([2138179,2138275,2138371,2138467,2134243,2134435,2138563,2138659,2138755,2138851,2138947,2139043,2138947,2138755,2139139,2139235]),
  new Uint32Array([23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0]),
  new Uint32Array([0,0,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2250498,2250562,2250625,2250657,2208321,2250689,2250721,2250753,2250785,2250817,2250849,2218945,2250881,2250913,2250945,0]),
  new Uint32Array([2170369,2105569,2098305,2108481,2173249,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456]),
  new Uint32Array([2100897,2111905,2105473,2105569,2105601,0,2108193,0,0,0,2098305,2108321,2108289,2100865,2113153,2108481]),
  new Uint32Array([2100897,2100897,2105569,2105569,6291456,2112289,2149826,6291456,6291456,2112481,2112577,2098177,2098177,2098177,6291456,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,6291456,6291456,6291456]),
  new Uint32Array([6291456,2169953,2169985,6291456,2170017,6291456,2170049,2170081,6291456,2170113,2170145,2170177,6291456,6291456,2170209,2170241]),
  new Uint32Array([6291456,6291456,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([0,0,0,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2220641,2220641,2220673,2220673,2220673,2220673,2220705,2220705,2220705,2220705,2220737,2220737,2220737,2220737,2220769,2220769]),
  new Uint32Array([2127650,2127746,2127842,2127938,2128034,2128130,2128226,2128322,2128418,2127523,2127619,2127715,2127811,2127907,2128003,2128099]),
  new Uint32Array([2143969,2173793,2173825,2153473,2173857,2173889,2173921,2173953,2173985,2173761,2174017,2174049,2174081,2174113,2174145,2174177]),
  new Uint32Array([0,0,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([2204705,2204737,2204769,2204801,2204833,2204865,2204897,2204929,2204961,2204993,2205025,2205057,2205089,2205121,2205153,2205185]),
  new Uint32Array([2176385,6291456,2176417,6291456,2176449,6291456,2176481,6291456,2176513,6291456,2176545,6291456,2176577,6291456,2176609,6291456]),
  new Uint32Array([2195521,2195553,2195585,2195617,2195649,2195681,2117857,2195713,2195745,2195777,2195809,2195841,2195873,2195905,2195937,2195969]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,6291456,6291456]),
  new Uint32Array([2173921,2173953,2173985,2174017,2174017,2174049,2174081,2174113,2174145,2174177,2149057,2233089,2173697,2173761,2173793,2174113]),
  new Uint32Array([2131586,2132450,2135970,2135778,2161602,2136162,2163650,2161794,2135586,2163714,2137186,2131810,2160290,2135170,2097506,2159554]),
  new Uint32Array([2134145,2097153,2134241,2105953,2132705,2130977,2160065,2131297,2162049,2133089,2160577,2133857,0,0,0,0]),
  new Uint32Array([2116513,2116609,2116705,2116801,2116897,2116993,2117089,2117185,2117281,2117377,2117473,2117569,2117665,2117761,2117857,2117953]),
  new Uint32Array([2100737,2098337,2101441,2101569,2101697,2101825,2101953,2102081,2102209,2100802,2101154,2101282,2101410,2101538,2101666,2101794]),
  new Uint32Array([2100289,2098657,2098049,2200737,2123489,2123681,2200769,2098625,2100321,2098145,2100449,2098017,2098753,2098977,2150241,2150305]),
  new Uint32Array([6291456,6291456,6291456,0,6291456,6291456,6291456,6291456,6291456,2109955,6291456,6291456,0,0,0,0]),
  new Uint32Array([18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368,18874368]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,6291456,0,6291456,0,0]),
  new Uint32Array([2130979,2131075,2131075,2131171,2131267,2131363,2131459,2131555,2131651,2131651,2131747,2131843,2131939,2132035,2132131,2132227]),
  new Uint32Array([0,2177793,6291456,2177825,6291456,2177857,6291456,2177889,6291456,2177921,6291456,2177953,6291456,2177985,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672]),
  new Uint32Array([6291456,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2113345,0,2098209,2111137,2105505,2098241,2108353,2108417,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289]),
  new Uint32Array([2136643,2136739,2136835,2136931,2137027,2137123,2137219,2137315,2137411,2137507,2137603,2137699,2137795,2137891,2137987,2138083]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0]),
  new Uint32Array([2174433,6291456,2174465,6291456,2174497,6291456,2174529,6291456,2174561,6291456,2174593,6291456,2174625,6291456,2174657,6291456]),
  new Uint32Array([0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2105473,2105569,2105601,2112289,2108193,2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441]),
  new Uint32Array([10496547,10496643,2105505,2149698,6291456,10496739,10496835,2170273,6291456,2149762,2105825,2111713,2111713,2111713,2111713,2168673]),
  new Uint32Array([6291456,2143490,2143490,2143490,2171649,6291456,2171681,2171713,2171745,6291456,2171777,6291456,2171809,6291456,2171841,6291456]),
  new Uint32Array([2159106,2159106,2159170,2159170,2159234,2159234,2159298,2159298,2159298,2159362,2159362,2159362,2106401,2106401,2106401,2106401]),
  new Uint32Array([2105601,2112289,2108193,2112481,2112577,2098177,2098305,2108321,2108289,2100865,2113153,2108481,2113345,2113441,2098209,2111137]),
  new Uint32Array([2108417,2181217,2181249,2181281,2170433,2170401,2181313,2181345,2181377,2181409,2181441,2181473,2181505,2181537,2170529,2181569]),
  new Uint32Array([2218433,2245761,2245793,2245825,2245857,2245890,2245953,2245986,2209665,2246050,2246113,2246146,2246210,2246274,2246337,2246369]),
  new Uint32Array([2230754,2230818,2230882,0,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([6291456,0,6291456,6291456,6291456,6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,0,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2184129,6291456,2184161,6291456,2184193,6291456,6291456,6291456,6291456,6291456,2146818,2183361,6291456,6291456,2142978,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2135170,2097506,2130691,2130787,2130883,2163970,2164034,2164098,2164162,2164226,2164290,2164354,2164418,2164482,2164546,2133122]),
  new Uint32Array([2108515,2108611,2100740,2108707,2108803,2108899,2108995,2109091,2109187,2109283,2109379,2109475,2109571,2109667,2109763,2100738]),
  new Uint32Array([2102788,2102916,2103044,2120515,2103172,2120611,2120707,2098373,2103300,2120803,2120899,2120995,2103428,2103556,2121091,2121187]),
  new Uint32Array([2158082,2158146,0,2158210,2158274,0,2158338,2158402,2158466,2129922,2158530,2158594,2158658,2158722,2158786,2158850]),
  new Uint32Array([10499619,10499715,10499811,10499907,10500003,10500099,10500195,10500291,10500387,10500483,10500579,10500675,10500771,10500867,10500963,10501059]),
  new Uint32Array([2239585,2239618,2239681,2239713,0,2191969,2239745,2239777,2192033,2239809,2239841,2239874,2239937,2239970,2240033,2240065]),
  new Uint32Array([2252705,2252738,2252801,2252833,2252865,2252897,2252930,2252994,2253057,2253089,2253121,2253154,2253217,2253250,2219361,2219361]),
  new Uint32Array([2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289,2108193,2112481,2112577,2098177,2098305,2108321,2108289,2100865]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,10538050,10538114,10538178,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([2226402,2226466,2226530,2226594,2226658,2226722,2226786,2226850,2226914,2226978,2227042,2227106,2227170,2227234,2227298,2227362]),
  new Uint32Array([23068672,6291456,6291456,6291456,6291456,2144066,2144130,2144194,2144258,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,23068672,23068672,23068672,6291456,23068672,23068672]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0]),
  new Uint32Array([2124674,2124770,2123875,2123971,2124067,2124163,2124259,2124355,2124451,2124547,2124643,2124739,2124835,2124931,2125027,2125123]),
  new Uint32Array([2168065,6291456,2168097,6291456,2168129,6291456,2168161,6291456,2168193,6291456,2168225,6291456,2168257,6291456,2168289,6291456]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,0]),
  new Uint32Array([23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,2100610,2100611,6291456,2107842,2107843,6291456,6291456,6291456,6291456,10537922,6291456,10537986,6291456]),
  new Uint32Array([2174849,2174881,2174913,2174945,2174977,2175009,2175041,2175073,2175105,2175137,2175169,2175201,2175233,2175265,2175297,2175329]),
  new Uint32Array([2154562,2154626,2154690,2154754,2141858,2154818,2154882,2127298,2154946,2127298,2155010,2155074,2155138,2155202,2155266,2155202]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456,6291456,6291456,6291456,6291456,23068672,0]),
  new Uint32Array([2200641,2150786,2150850,2150914,2150978,2151042,2106562,2151106,2150562,2151170,2151234,2151298,2151362,2151426,2151490,2151554]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,23068672,0,0,0,0,0,0,0,0,6291456,6291456]),
  new Uint32Array([2220289,2220289,2220321,2220321,2220321,2220321,2220353,2220353,2220353,2220353,2220385,2220385,2220385,2220385,2220417,2220417]),
  new Uint32Array([2155330,2155394,0,2155458,2155522,2155586,2105732,0,2155650,2155714,2155778,2125314,2155842,2155906,2126274,2155970]),
  new Uint32Array([23068672,23068672,23068672,23068672,23068672,6291456,6291456,23068672,23068672,6291456,23068672,23068672,23068672,23068672,6291456,6291456]),
  new Uint32Array([6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,6291456,0,0,0,0,0,0]),
  new Uint32Array([2097729,2106017,2106017,2106017,2106017,2131297,2131297,2131297,2131297,2106081,2106081,2162049,2162049,2105953,2105953,2162337]),
  new Uint32Array([2097185,2097697,2097697,2097697,2097697,2135777,2135777,2135777,2135777,2097377,2097377,2097377,2097377,2097601,2097601,2097217]),
  new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23068672]),
  new Uint32Array([2139331,2139427,2139523,2139043,2133571,2132611,2139619,2139715,0,0,0,0,0,0,0,0]),
  new Uint32Array([2174113,2174145,2100897,2098177,2108289,2100865,2173601,2173633,2173985,2174113,2174145,6291456,6291456,6291456,6291456,6291456]),
  new Uint32Array([6291456,6291456,23068672,6291456,6291456,6291456,23068672,6291456,6291456,6291456,6291456,23068672,6291456,6291456,6291456,6291456]),
  new Uint32Array([23068672,23068672,18923778,23068672,23068672,23068672,23068672,18923842,23068672,23068672,23068672,23068672,18923906,23068672,23068672,23068672]),
  new Uint32Array([2134145,2097153,2134241,0,2132705,2130977,2160065,2131297,0,2133089,0,2133857,0,0,0,0]),
  new Uint32Array([6291456,6291456,6291456,6291456,0,0,0,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2177537,6291456,2177569,6291456,2177601,6291456,2177633,6291456,2177665,6291456,2177697,6291456,2177729,6291456,2177761,6291456]),
  new Uint32Array([2212481,2212513,2212545,2212577,2197121,2212609,2212641,2212673,2212705,2212737,2212769,2212801,2212833,2212865,2212897,2212929]),
  new Uint32Array([6291456,6291456,23068672,23068672,23068672,6291456,6291456,0,0,0,0,0,0,0,0,0]),
  new Uint32Array([2098241,2108353,2170209,2105825,2111713,2100897,2111905,2105473,2105569,2105601,2112289,6291456,2108193,2172417,2112481,2098177]),
  new Uint32Array([6291456,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,23068672,6291456,6291456]),
];
var blockIdxes = new Uint16Array([616,616,565,147,161,411,330,2,131,131,328,454,241,408,86,86,696,113,285,350,325,301,473,214,639,232,447,64,369,598,124,672,567,223,621,154,107,86,86,86,86,86,86,505,86,68,634,86,218,218,218,218,486,218,218,513,188,608,216,86,217,463,668,85,700,360,184,86,86,86,647,402,153,10,346,718,662,260,145,298,117,1,443,342,138,54,563,86,240,572,218,70,387,86,118,460,641,602,86,86,306,218,86,692,86,86,86,86,86,162,707,86,458,26,86,218,638,86,86,86,86,86,65,449,86,86,306,183,86,58,391,667,86,157,131,131,131,131,86,433,131,406,31,218,247,86,86,693,218,581,351,86,438,295,69,462,45,126,173,650,14,295,69,97,168,187,641,78,523,390,69,108,287,664,173,219,83,295,69,108,431,426,173,694,412,115,628,52,257,398,641,118,501,121,69,579,151,423,173,620,464,121,69,382,151,476,173,27,53,121,86,594,578,226,173,86,632,130,86,96,228,268,641,622,563,86,86,21,148,650,131,131,321,43,144,343,381,531,131,131,178,20,86,399,156,375,164,541,30,60,715,198,92,118,131,131,86,86,306,407,86,280,457,196,488,358,131,131,244,86,86,143,86,86,86,86,86,667,563,86,86,86,86,86,86,86,86,86,86,86,86,86,336,363,86,86,336,86,86,380,678,67,86,86,86,678,86,86,86,512,86,307,86,708,86,86,86,86,86,528,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,563,307,86,86,86,86,86,104,450,337,86,720,86,32,450,397,86,86,86,587,218,558,708,708,293,708,86,86,86,86,86,694,205,86,8,86,86,86,86,549,86,667,697,697,679,86,458,460,86,86,650,86,708,543,86,86,86,245,86,86,86,140,218,127,708,708,458,197,131,131,131,131,500,86,86,483,251,86,306,510,515,86,722,86,86,86,65,201,86,86,483,580,470,86,86,86,368,131,131,131,694,114,110,555,86,86,123,721,163,142,713,418,86,317,675,209,218,218,218,371,545,592,629,490,603,199,46,320,525,680,310,279,388,111,42,252,593,607,235,617,410,377,50,548,135,356,17,520,189,116,392,600,349,332,482,699,690,535,119,106,451,71,152,667,131,218,218,265,671,637,492,504,533,683,269,269,658,86,86,86,86,86,86,86,86,86,491,619,86,86,6,86,86,86,86,86,86,86,86,86,86,86,229,86,86,86,86,86,86,86,86,86,86,86,86,667,86,86,171,131,118,131,656,206,234,571,89,334,670,246,311,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,534,86,86,86,86,86,86,82,86,86,86,86,86,430,86,86,86,86,86,86,86,86,86,599,86,324,86,470,69,640,264,131,626,101,174,86,86,667,233,105,73,374,394,221,204,84,28,326,86,86,471,86,86,86,109,573,86,171,200,200,200,200,218,218,86,86,86,86,460,131,131,131,86,506,86,86,86,86,86,220,404,34,614,47,442,305,25,612,338,601,648,7,344,255,131,131,51,86,312,507,563,86,86,86,86,588,86,86,86,86,86,530,511,86,458,3,435,384,556,522,230,527,86,118,86,86,717,86,137,273,79,181,484,23,93,112,655,249,417,703,370,87,98,313,684,585,155,465,596,481,695,18,416,428,61,701,706,282,643,495,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,549,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,549,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,307,86,86,86,171,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,650,131,422,542,420,263,24,172,86,86,86,86,86,566,86,86,132,540,395,353,494,519,19,485,284,472,131,131,131,16,714,86,211,708,86,86,86,694,698,86,86,483,704,708,218,272,86,86,120,86,159,478,86,307,247,86,86,663,597,459,627,667,86,86,277,455,39,302,86,250,86,86,86,271,99,452,306,281,329,400,200,86,86,362,549,352,646,461,323,586,86,86,4,708,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,717,86,518,86,86,650,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,125,554,480,300,613,72,333,288,561,544,604,48,719,91,169,176,590,224,76,191,29,559,560,231,537,166,477,538,256,437,131,131,469,167,40,0,685,266,441,705,239,642,475,568,640,610,299,673,517,318,385,22,202,180,179,359,424,215,90,66,521,653,467,682,453,409,479,88,131,661,35,303,15,262,666,630,712,131,131,618,659,175,218,195,347,193,227,261,150,165,709,546,294,569,710,270,413,376,524,55,242,38,419,529,170,657,3,304,122,379,278,131,651,86,67,576,458,458,131,131,86,86,86,86,86,86,86,118,309,86,86,547,86,86,86,86,667,650,664,131,131,86,86,56,131,131,131,131,131,131,131,131,86,307,86,86,86,664,238,650,86,86,717,86,118,86,86,315,86,59,86,86,574,549,131,131,340,57,436,86,86,86,86,86,86,458,708,499,691,62,86,650,86,86,694,86,86,86,319,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,171,86,549,694,131,131,131,131,131,131,131,131,131,77,86,86,139,86,502,86,86,86,667,595,131,131,131,86,12,86,13,86,609,131,131,131,131,86,86,86,625,86,669,86,86,182,129,86,5,694,104,86,86,86,86,131,131,86,86,386,171,86,86,86,345,86,324,86,589,86,213,36,131,131,131,131,131,86,86,86,86,104,131,131,131,141,290,80,677,86,86,86,267,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,667,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,515,86,86,33,136,669,86,711,515,86,86,550,640,86,104,708,515,86,159,372,717,86,86,444,515,86,86,663,37,86,563,460,86,390,624,702,131,131,131,131,389,59,708,86,86,341,208,708,635,295,69,108,431,508,100,190,131,131,131,131,131,131,131,131,86,86,86,649,516,660,131,131,86,86,86,218,631,708,131,131,131,131,131,131,131,131,131,131,86,86,341,575,238,514,131,131,86,86,86,218,291,708,307,131,86,86,306,367,708,131,131,131,86,378,697,86,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,615,253,86,86,86,292,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,104,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,69,86,341,553,549,86,307,86,86,645,275,455,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,708,131,131,131,131,131,131,86,86,86,86,86,86,667,460,86,86,86,86,86,86,86,86,86,86,86,86,717,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,667,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,171,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,104,86,667,459,131,131,131,131,131,131,86,458,225,86,86,86,516,549,11,390,405,86,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,460,44,218,197,711,515,131,131,131,131,664,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,307,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,308,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,640,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,118,307,104,286,591,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,549,86,86,681,86,86,75,185,314,582,86,358,496,474,86,104,131,86,86,86,86,146,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,171,86,640,131,131,131,131,131,131,131,131,246,503,689,339,674,81,258,415,439,128,562,366,414,246,503,689,583,222,557,316,636,665,186,355,95,670,246,503,689,339,674,557,258,415,439,186,355,95,670,246,503,689,446,644,536,652,331,532,335,440,274,421,297,570,74,425,364,425,606,552,403,509,134,365,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,218,218,218,498,218,218,577,627,551,497,572,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,553,354,236,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,296,455,131,131,456,243,103,86,41,459,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,9,276,158,716,393,564,383,489,401,654,210,654,131,131,131,640,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,650,86,86,86,86,86,86,717,667,563,563,563,86,549,102,686,133,246,605,86,448,86,86,207,307,131,131,131,641,86,177,611,445,373,194,584,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,308,307,171,86,86,86,86,86,86,86,717,86,86,86,86,86,460,131,131,650,86,86,86,694,708,86,86,694,86,458,131,131,131,131,131,131,667,694,289,650,667,131,131,86,640,131,131,664,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,171,131,131,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,460,86,86,86,86,86,86,86,86,86,86,86,86,86,458,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,86,640,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,466,203,149,429,94,432,160,687,539,63,237,283,192,248,348,259,427,526,396,676,254,468,487,212,327,623,49,633,322,493,434,688,357,361,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131,131]);
var mappingStr = "صلى الله عليه وسلمجل جلالهキロメートルrad∕s2エスクードキログラムキロワットグラムトンクルゼイロサンチームパーセントピアストルファラッドブッシェルヘクタールマンションミリバールレントゲン′′′′1⁄10viii(10)(11)(12)(13)(14)(15)(16)(17)(18)(19)(20)∫∫∫∫(오전)(오후)アパートアルファアンペアイニングエーカーカラットカロリーキュリーギルダークローネサイクルシリングバーレルフィートポイントマイクロミクロンメガトンリットルルーブル株式会社kcalm∕s2c∕kgاكبرمحمدصلعمرسولریال1⁄41⁄23⁄4 ̈́ྲཱྀླཱྀ ̈͂ ̓̀ ̓́ ̓͂ ̔̀ ̔́ ̔͂ ̈̀‵‵‵a/ca/sc/oc/utelfax1⁄71⁄91⁄32⁄31⁄52⁄53⁄54⁄51⁄65⁄61⁄83⁄85⁄87⁄8xii0⁄3∮∮∮(1)(2)(3)(4)(5)(6)(7)(8)(9)(a)(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)(q)(r)(s)(t)(u)(v)(w)(x)(y)(z)::====(ᄀ)(ᄂ)(ᄃ)(ᄅ)(ᄆ)(ᄇ)(ᄉ)(ᄋ)(ᄌ)(ᄎ)(ᄏ)(ᄐ)(ᄑ)(ᄒ)(가)(나)(다)(라)(마)(바)(사)(아)(자)(차)(카)(타)(파)(하)(주)(一)(二)(三)(四)(五)(六)(七)(八)(九)(十)(月)(火)(水)(木)(金)(土)(日)(株)(有)(社)(名)(特)(財)(祝)(労)(代)(呼)(学)(監)(企)(資)(協)(祭)(休)(自)(至)pte10月11月12月ergltdアールインチウォンオンスオームカイリガロンガンマギニーケースコルナコーポセンチダースノットハイツパーツピクルフランペニヒヘルツペンスページベータボルトポンドホールホーンマイルマッハマルクヤードヤールユアンルピー10点11点12点13点14点15点16点17点18点19点20点21点22点23点24点hpabardm2dm3khzmhzghzthzmm2cm2km2mm3cm3km3kpampagpalogmilmolppmv∕ma∕m10日11日12日13日14日15日16日17日18日19日20日21日22日23日24日25日26日27日28日29日30日31日galffifflשּׁשּׂ ٌّ ٍّ َّ ُّ ِّ ّٰـَّـُّـِّتجمتحجتحمتخمتمجتمحتمخجمححميحمىسحجسجحسجىسمحسمجسممصححصممشحمشجيشمخشممضحىضخمطمحطممطميعجمعممعمىغممغميغمىفخمقمحقمملحملحيلحىلججلخملمحمحجمحيمجحمجممخممجخهمجهممنحمنحىنجمنجىنمينمىيممبخيتجيتجىتخيتخىتميتمىجميجحىجمىسخىصحيشحيضحيلجيلمييحييجييميمميقمينحيعميكمينجحمخيلجمكممجحيحجيمجيفميبحيسخينجيصلےقلے𝅘𝅥𝅮𝅘𝅥𝅯𝅘𝅥𝅰𝅘𝅥𝅱𝅘𝅥𝅲𝆹𝅥𝅮𝆺𝅥𝅮𝆹𝅥𝅯𝆺𝅥𝅯〔s〕ppv〔本〕〔三〕〔二〕〔安〕〔点〕〔打〕〔盗〕〔勝〕〔敗〕 ̄ ́ ̧ssi̇ijl·ʼndžljnjdz ̆ ̇ ̊ ̨ ̃ ̋ ιեւاٴوٴۇٴيٴक़ख़ग़ज़ड़ढ़फ़य़ড়ঢ়য়ਲ਼ਸ਼ਖ਼ਗ਼ਜ਼ਫ਼ଡ଼ଢ଼ําໍາຫນຫມགྷཌྷདྷབྷཛྷཀྵཱཱིུྲྀླྀྒྷྜྷྡྷྦྷྫྷྐྵaʾἀιἁιἂιἃιἄιἅιἆιἇιἠιἡιἢιἣιἤιἥιἦιἧιὠιὡιὢιὣιὤιὥιὦιὧιὰιαιάιᾶι ͂ὴιηιήιῆιὼιωιώιῶι ̳!!̅???!!?rs°c°fnosmtmivix⫝̸ ゙ ゚よりコト333435참고주의363738394042444546474849503月4月5月6月7月8月9月hgevギガデシドルナノピコビルペソホンリラレムdaauovpciu平成昭和大正明治naμakakbmbgbpfnfμfμgmgμlmldlklfmnmμmpsnsμsmsnvμvkvpwnwμwmwkwkωmωbqcccddbgyhainkkktlnlxphprsrsvwbstմնմեմիվնմխיִײַשׁשׂאַאָאּבּגּדּהּוּזּטּיּךּכּלּמּנּסּףּפּצּקּרּתּוֹבֿכֿפֿאלئائەئوئۇئۆئۈئېئىئجئحئمئيبجبمبىبيتىتيثجثمثىثيخحضجضمطحظمغجفجفحفىفيقحقىقيكاكجكحكخكلكىكينخنىنيهجهىهييىذٰرٰىٰئرئزئنبزبنترتزتنثرثزثنمانرنزننيريزئخئهبهتهصخنههٰثهسهشهطىطيعىعيغىغيسىسيشىشيصىصيضىضيشخشرسرصرضراً ًـًـّ ْـْلآلألإ𝅗𝅥0,1,2,3,4,5,6,7,8,9,wzhvsdwcmcmddjほかココàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþāăąćĉċčďđēĕėęěĝğġģĥħĩīĭįĵķĺļľłńņňŋōŏőœŕŗřśŝşšţťŧũūŭůűųŵŷÿźżɓƃƅɔƈɖɗƌǝəɛƒɠɣɩɨƙɯɲɵơƣƥʀƨʃƭʈưʊʋƴƶʒƹƽǎǐǒǔǖǘǚǜǟǡǣǥǧǩǫǭǯǵƕƿǹǻǽǿȁȃȅȇȉȋȍȏȑȓȕȗșțȝȟƞȣȥȧȩȫȭȯȱȳⱥȼƚⱦɂƀʉʌɇɉɋɍɏɦɹɻʁʕͱͳʹͷ;ϳέίόύβγδεζθκλνξοπρστυφχψϊϋϗϙϛϝϟϡϣϥϧϩϫϭϯϸϻͻͼͽѐёђѓєѕіїјљњћќѝўџабвгдежзийклмнопрстуфхцчшщъыьэюяѡѣѥѧѩѫѭѯѱѳѵѷѹѻѽѿҁҋҍҏґғҕҗҙқҝҟҡңҥҧҩҫҭүұҳҵҷҹһҽҿӂӄӆӈӊӌӎӑӓӕӗәӛӝӟӡӣӥӧөӫӭӯӱӳӵӷӹӻӽӿԁԃԅԇԉԋԍԏԑԓԕԗԙԛԝԟԡԣԥԧԩԫԭԯաբգդզէըթժլծկհձղճյշոչպջռստրցփքօֆ་ⴧⴭნᏰᏱᏲᏳᏴᏵꙋɐɑᴂɜᴖᴗᴝᴥɒɕɟɡɥɪᵻʝɭᶅʟɱɰɳɴɸʂƫᴜʐʑḁḃḅḇḉḋḍḏḑḓḕḗḙḛḝḟḡḣḥḧḩḫḭḯḱḳḵḷḹḻḽḿṁṃṅṇṉṋṍṏṑṓṕṗṙṛṝṟṡṣṥṧṩṫṭṯṱṳṵṷṹṻṽṿẁẃẅẇẉẋẍẏẑẓẕạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹỻỽỿἐἑἒἓἔἕἰἱἲἳἴἵἶἷὀὁὂὃὄὅὑὓὕὗᾰᾱὲΐῐῑὶΰῠῡὺῥ`ὸ‐+−∑〈〉ⰰⰱⰲⰳⰴⰵⰶⰷⰸⰹⰺⰻⰼⰽⰾⰿⱀⱁⱂⱃⱄⱅⱆⱇⱈⱉⱊⱋⱌⱍⱎⱏⱐⱑⱒⱓⱔⱕⱖⱗⱘⱙⱚⱛⱜⱝⱞⱡɫᵽɽⱨⱪⱬⱳⱶȿɀⲁⲃⲅⲇⲉⲋⲍⲏⲑⲓⲕⲗⲙⲛⲝⲟⲡⲣⲥⲧⲩⲫⲭⲯⲱⲳⲵⲷⲹⲻⲽⲿⳁⳃⳅⳇⳉⳋⳍⳏⳑⳓⳕⳗⳙⳛⳝⳟⳡⳣⳬⳮⳳⵡ母龟丨丶丿乙亅亠人儿入冂冖冫几凵刀力勹匕匚匸卜卩厂厶又口囗士夂夊夕女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳心戈戶手支攴文斗斤方无曰欠止歹殳毋比毛氏气爪父爻爿片牙牛犬玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立竹米糸缶网羊羽老而耒耳聿肉臣臼舌舛舟艮色艸虍虫血行衣襾見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里長門阜隶隹雨靑非面革韋韭音頁風飛食首香馬骨高髟鬥鬯鬲鬼魚鳥鹵鹿麥麻黃黍黑黹黽鼎鼓鼠鼻齊齒龍龜龠.〒卄卅ᄁᆪᆬᆭᄄᆰᆱᆲᆳᆴᆵᄚᄈᄡᄊ짜ᅢᅣᅤᅥᅦᅧᅨᅩᅪᅫᅬᅭᅮᅯᅰᅱᅲᅳᅴᅵᄔᄕᇇᇈᇌᇎᇓᇗᇙᄜᇝᇟᄝᄞᄠᄢᄣᄧᄩᄫᄬᄭᄮᄯᄲᄶᅀᅇᅌᇱᇲᅗᅘᅙᆄᆅᆈᆑᆒᆔᆞᆡ上中下甲丙丁天地問幼箏우秘男適優印注項写左右医宗夜テヌモヨヰヱヲꙁꙃꙅꙇꙉꙍꙏꙑꙓꙕꙗꙙꙛꙝꙟꙡꙣꙥꙧꙩꙫꙭꚁꚃꚅꚇꚉꚋꚍꚏꚑꚓꚕꚗꚙꚛꜣꜥꜧꜩꜫꜭꜯꜳꜵꜷꜹꜻꜽꜿꝁꝃꝅꝇꝉꝋꝍꝏꝑꝓꝕꝗꝙꝛꝝꝟꝡꝣꝥꝧꝩꝫꝭꝯꝺꝼᵹꝿꞁꞃꞅꞇꞌꞑꞓꞗꞙꞛꞝꞟꞡꞣꞥꞧꞩɬʞʇꭓꞵꞷꬷꭒᎠᎡᎢᎣᎤᎥᎦᎧᎨᎩᎪᎫᎬᎭᎮᎯᎰᎱᎲᎳᎴᎵᎶᎷᎸᎹᎺᎻᎼᎽᎾᎿᏀᏁᏂᏃᏄᏅᏆᏇᏈᏉᏊᏋᏌᏍᏎᏏᏐᏑᏒᏓᏔᏕᏖᏗᏘᏙᏚᏛᏜᏝᏞᏟᏠᏡᏢᏣᏤᏥᏦᏧᏨᏩᏪᏫᏬᏭᏮᏯ豈更賈滑串句契喇奈懶癩羅蘿螺裸邏樂洛烙珞落酪駱亂卵欄爛蘭鸞嵐濫藍襤拉臘蠟廊朗浪狼郎來冷勞擄櫓爐盧蘆虜路露魯鷺碌祿綠菉錄論壟弄籠聾牢磊賂雷壘屢樓淚漏累縷陋勒肋凜凌稜綾菱陵讀拏諾丹寧怒率異北磻便復不泌數索參塞省葉說殺沈拾若掠略亮兩凉梁糧良諒量勵呂廬旅濾礪閭驪麗黎曆歷轢年憐戀撚漣煉璉秊練聯輦蓮連鍊列劣咽烈裂廉念捻殮簾獵令囹嶺怜玲瑩羚聆鈴零靈領例禮醴隸惡了僚寮尿料燎療蓼遼暈阮劉杻柳流溜琉留硫紐類戮陸倫崙淪輪律慄栗隆利吏履易李梨泥理痢罹裏裡離匿溺吝燐璘藺隣鱗麟林淋臨笠粒狀炙識什茶刺切度拓糖宅洞暴輻降廓兀嗀塚晴凞猪益礼神祥福靖精蘒諸逸都飯飼館鶴郞隷侮僧免勉勤卑喝嘆器塀墨層悔慨憎懲敏既暑梅海渚漢煮爫琢碑祉祈祐祖禍禎穀突節縉繁署者臭艹著褐視謁謹賓贈辶難響頻恵𤋮舘並况全侀充冀勇勺啕喙嗢墳奄奔婢嬨廒廙彩徭惘慎愈慠戴揄搜摒敖望杖滛滋瀞瞧爵犯瑱甆画瘝瘟盛直睊着磌窱类絛缾荒華蝹襁覆調請諭變輸遲醙鉶陼韛頋鬒𢡊𢡄𣏕㮝䀘䀹𥉉𥳐𧻓齃龎עםٱٻپڀٺٿٹڤڦڄڃچڇڍڌڎڈژڑکگڳڱںڻۀہھۓڭۋۅۉ、〖〗—–_{}【】《》「」『』[]#&*-<>\\$%@ءؤة\"'^|~⦅⦆・ゥャ¢£¬¦¥₩│←↑→↓■○𐐨𐐩𐐪𐐫𐐬𐐭𐐮𐐯𐐰𐐱𐐲𐐳𐐴𐐵𐐶𐐷𐐸𐐹𐐺𐐻𐐼𐐽𐐾𐐿𐑀𐑁𐑂𐑃𐑄𐑅𐑆𐑇𐑈𐑉𐑊𐑋𐑌𐑍𐑎𐑏𐓘𐓙𐓚𐓛𐓜𐓝𐓞𐓟𐓠𐓡𐓢𐓣𐓤𐓥𐓦𐓧𐓨𐓩𐓪𐓫𐓬𐓭𐓮𐓯𐓰𐓱𐓲𐓳𐓴𐓵𐓶𐓷𐓸𐓹𐓺𐓻𐳀𐳁𐳂𐳃𐳄𐳅𐳆𐳇𐳈𐳉𐳊𐳋𐳌𐳍𐳎𐳏𐳐𐳑𐳒𐳓𐳔𐳕𐳖𐳗𐳘𐳙𐳚𐳛𐳜𐳝𐳞𐳟𐳠𐳡𐳢𐳣𐳤𐳥𐳦𐳧𐳨𐳩𐳪𐳫𐳬𐳭𐳮𐳯𐳰𐳱𐳲𑣀𑣁𑣂𑣃𑣄𑣅𑣆𑣇𑣈𑣉𑣊𑣋𑣌𑣍𑣎𑣏𑣐𑣑𑣒𑣓𑣔𑣕𑣖𑣗𑣘𑣙𑣚𑣛𑣜𑣝𑣞𑣟ıȷ∇∂𞤢𞤣𞤤𞤥𞤦𞤧𞤨𞤩𞤪𞤫𞤬𞤭𞤮𞤯𞤰𞤱𞤲𞤳𞤴𞤵𞤶𞤷𞤸𞤹𞤺𞤻𞤼𞤽𞤾𞤿𞥀𞥁𞥂𞥃ٮڡٯ字双多解交映無前後再新初終販声吹演投捕遊指禁空合満申割営配得可丽丸乁𠄢你侻倂偺備像㒞𠘺兔兤具𠔜㒹內𠕋冗冤仌冬𩇟刃㓟刻剆剷㔕包匆卉博即卽卿𠨬灰及叟𠭣叫叱吆咞吸呈周咢哶唐啓啣善喫喳嗂圖圗噑噴壮城埴堍型堲報墬𡓤売壷夆夢奢𡚨𡛪姬娛娧姘婦㛮嬈嬾𡧈寃寘寳𡬘寿将㞁屠峀岍𡷤嵃𡷦嵮嵫嵼巡巢㠯巽帨帽幩㡢𢆃㡼庰庳庶𪎒𢌱舁弢㣇𣊸𦇚形彫㣣徚忍志忹悁㤺㤜𢛔惇慈慌慺憲憤憯懞戛扝抱拔捐𢬌挽拼捨掃揤𢯱搢揅掩㨮摩摾撝摷㩬敬𣀊旣書晉㬙㬈㫤冒冕最暜肭䏙朡杞杓𣏃㭉柺枅桒𣑭梎栟椔楂榣槪檨𣚣櫛㰘次𣢧歔㱎歲殟殻𣪍𡴋𣫺汎𣲼沿泍汧洖派浩浸涅𣴞洴港湮㴳滇𣻑淹潮𣽞𣾎濆瀹瀛㶖灊災灷炭𠔥煅𤉣熜爨牐𤘈犀犕𤜵𤠔獺王㺬玥㺸瑇瑜璅瓊㼛甤𤰶甾𤲒𢆟瘐𤾡𤾸𥁄㿼䀈𥃳𥃲𥄙𥄳眞真瞋䁆䂖𥐝硎䃣𥘦𥚚𥛅秫䄯穊穏𥥼𥪧䈂𥮫篆築䈧𥲀糒䊠糨糣紀𥾆絣䌁緇縂繅䌴𦈨𦉇䍙𦋙罺𦌾羕翺𦓚𦔣聠𦖨聰𣍟䏕育脃䐋脾媵𦞧𦞵𣎓𣎜舄辞䑫芑芋芝劳花芳芽苦𦬼茝荣莭茣莽菧荓菊菌菜𦰶𦵫𦳕䔫蓱蓳蔖𧏊蕤𦼬䕝䕡𦾱𧃒䕫虐虧虩蚩蚈蜎蛢蜨蝫螆蟡蠁䗹衠𧙧裗裞䘵裺㒻𧢮𧥦䚾䛇誠𧲨貫賁贛起𧼯𠠄跋趼跰𠣞軔𨗒𨗭邔郱鄑𨜮鄛鈸鋗鋘鉼鏹鐕𨯺開䦕閷𨵷䧦雃嶲霣𩅅𩈚䩮䩶韠𩐊䪲𩒖頩𩖶飢䬳餩馧駂駾䯎𩬰鱀鳽䳎䳭鵧𪃎䳸𪄅𪈎𪊑䵖黾鼅鼏鼖𪘀";

function mapChar(codePoint) {
  if (codePoint >= 0x30000) {
    // High planes are special cased.
    if (codePoint >= 0xE0100 && codePoint <= 0xE01EF)
      return 18874368;
    return 0;
  }
  return blocks[blockIdxes[codePoint >> 4]][codePoint & 15];
}

return {
  mapStr: mappingStr,
  mapChar: mapChar
};
}));

},{}],297:[function(require,module,exports){
(function(root, factory) {
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define(['punycode', './idna-map'], function(punycode, idna_map) {
      return factory(punycode, idna_map);
    });
  }
  else if (typeof exports === 'object') {
    module.exports = factory(require('punycode'), require('./idna-map'));
  }
  else {
    root.uts46 = factory(root.punycode, root.idna_map);
  }
}(this, function(punycode, idna_map) {

  function mapLabel(label, useStd3ASCII, transitional) {
    var mapped = [];
    var chars = punycode.ucs2.decode(label);
    for (var i = 0; i < chars.length; i++) {
      var cp = chars[i];
      var ch = punycode.ucs2.encode([chars[i]]);
      var composite = idna_map.mapChar(cp);
      var flags = (composite >> 23);
      var kind = (composite >> 21) & 3;
      var index = (composite >> 5) & 0xffff;
      var length = composite & 0x1f;
      var value = idna_map.mapStr.substr(index, length);
      if (kind === 0 || (useStd3ASCII && (flags & 1))) {
        throw new Error("Illegal char " + ch);
      }
      else if (kind === 1) {
        mapped.push(value);
      }
      else if (kind === 2) {
        mapped.push(transitional ? value : ch);
      }
      /* istanbul ignore next */
      else if (kind === 3) {
        mapped.push(ch);
      }
    }

    var newLabel = mapped.join("").normalize("NFC");
    return newLabel;
  }

  function process(domain, transitional, useStd3ASCII) {
    /* istanbul ignore if */
    if (useStd3ASCII === undefined)
      useStd3ASCII = false;
    var mappedIDNA = mapLabel(domain, useStd3ASCII, transitional);

    // Step 3. Break
    var labels = mappedIDNA.split(".");

    // Step 4. Convert/Validate
    labels = labels.map(function(label) {
      if (label.startsWith("xn--")) {
        label = punycode.decode(label.substring(4));
        validateLabel(label, useStd3ASCII, false);
      }
      else {
        validateLabel(label, useStd3ASCII, transitional);
      }
      return label;
    });

    return labels.join(".");
  }

  function validateLabel(label, useStd3ASCII, transitional) {
    // 2. The label must not contain a U+002D HYPHEN-MINUS character in both the
    // third position and fourth positions.
    if (label[2] === '-' && label[3] === '-')
      throw new Error("Failed to validate " + label);

    // 3. The label must neither begin nor end with a U+002D HYPHEN-MINUS
    // character.
    if (label.startsWith('-') || label.endsWith('-'))
      throw new Error("Failed to validate " + label);

    // 4. The label must not contain a U+002E ( . ) FULL STOP.
    // this should nerver happen as label is chunked internally by this character
    /* istanbul ignore if */
    if (label.includes('.'))
      throw new Error("Failed to validate " + label);

    if (mapLabel(label, useStd3ASCII, transitional) !== label)
      throw new Error("Failed to validate " + label);

    // 5. The label must not begin with a combining mark, that is:
    // General_Category=Mark.
    var ch = label.codePointAt(0);
    if (idna_map.mapChar(ch) & (0x2 << 23))
      throw new Error("Label contains illegal character:" + ch);
  }

  function toAscii(domain, options) {
    if (options === undefined)
      options = {};
    var transitional = 'transitional' in options ? options.transitional : true;
    var useStd3ASCII = 'useStd3ASCII' in options ? options.useStd3ASCII : false;
    var verifyDnsLength = 'verifyDnsLength' in options ? options.verifyDnsLength : false;
    var labels = process(domain, transitional, useStd3ASCII).split('.');
    var asciiLabels = labels.map(punycode.toASCII);
    var asciiString = asciiLabels.join('.');
    var i;
    if (verifyDnsLength) {
      if (asciiString.length < 1 || asciiString.length > 253) {
        throw new Error("DNS name has wrong length:" + asciiString);
      }
      for (i = 0; i < asciiLabels.length; i++) {//for .. of replacement
        var label = asciiLabels[i];
        if (label.length < 1 || label.length > 63)
          throw new Error("DNS label has wrong length:" + label);
      }
    }
    return asciiString;
  }

  function toUnicode(domain, options) {
    if (options === undefined)
      options = {};
    var useStd3ASCII = 'useStd3ASCII' in options ? options.useStd3ASCII : false;
    return process(domain, false, useStd3ASCII);
  }

  return {
    toUnicode: toUnicode,
    toAscii: toAscii,
  };
}));

},{"./idna-map":296,"punycode":128}],298:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"dup":102}],299:[function(require,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (typeof value === 'function' && !value.prototype) { return true; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};

},{}],300:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],301:[function(require,module,exports){
/**
 * Returns a `Boolean` on whether or not the a `String` starts with '0x'
 * @param {String} str the string input value
 * @return {Boolean} a boolean if it is or is not hex prefixed
 * @throws if the str input is not a string
 */
module.exports = function isHexPrefixed(str) {
  if (typeof str !== 'string') {
    throw new Error("[is-hex-prefixed] value must be type 'string',is currently type " + (typeof str) + ",while checking isHexPrefixed.");
  }

  return str.slice(0, 2) === '0x';
}

},{}],302:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"dup":105,"hash-base":282,"inherits":298,"safe-buffer":334}],303:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"bn.js":195,"brorand":196,"dup":106}],304:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"dup":107}],305:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"dup":108}],306:[function(require,module,exports){
arguments[4][277][0].apply(exports,arguments)
},{"dup":277}],307:[function(require,module,exports){
var BN = require('bn.js');
var stripHexPrefix = require('strip-hex-prefix');

/**
 * Returns a BN object, converts a number value to a BN
 * @param {String|Number|Object} `arg` input a string number, hex string number, number, BigNumber or BN object
 * @return {Object} `output` BN object of the number
 * @throws if the argument is not an array, object that isn't a bignumber, not a string number or number
 */
module.exports = function numberToBN(arg) {
  if (typeof arg === 'string' || typeof arg === 'number') {
    var multiplier = new BN(1); // eslint-disable-line
    var formattedString = String(arg).toLowerCase().trim();
    var isHexPrefixed = formattedString.substr(0, 2) === '0x' || formattedString.substr(0, 3) === '-0x';
    var stringArg = stripHexPrefix(formattedString); // eslint-disable-line
    if (stringArg.substr(0, 1) === '-') {
      stringArg = stripHexPrefix(stringArg.slice(1));
      multiplier = new BN(-1, 10);
    }
    stringArg = stringArg === '' ? '0' : stringArg;

    if ((!stringArg.match(/^-?[0-9]+$/) && stringArg.match(/^[0-9A-Fa-f]+$/))
      || stringArg.match(/^[a-fA-F]+$/)
      || (isHexPrefixed === true && stringArg.match(/^[0-9A-Fa-f]+$/))) {
      return new BN(stringArg, 16).mul(multiplier);
    }

    if ((stringArg.match(/^-?[0-9]+$/) || stringArg === '') && isHexPrefixed === false) {
      return new BN(stringArg, 10).mul(multiplier);
    }
  } else if (typeof arg === 'object' && arg.toString && (!arg.pop && !arg.push)) {
    if (arg.toString(10).match(/^-?[0-9]+$/) && (arg.mul || arg.dividedToIntegerBy)) {
      return new BN(arg.toString(10), 10);
    }
  }

  throw new Error('[number-to-bn] while converting number ' + JSON.stringify(arg) + ' to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported.');
}

},{"bn.js":306,"strip-hex-prefix":346}],308:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],309:[function(require,module,exports){
// This file is the concatenation of many js files.
// See http://github.com/jimhigson/oboe.js for the raw source

// having a local undefined, window, Object etc allows slightly better minification:
(function  (window, Object, Array, Error, JSON, undefined ) {

   // v2.1.3

/*

Copyright (c) 2013, Jim Higson

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1.  Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.

2.  Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

/** 
 * Partially complete a function.
 * 
 *  var add3 = partialComplete( function add(a,b){return a+b}, 3 );
 *  
 *  add3(4) // gives 7
 *  
 *  function wrap(left, right, cen){return left + " " + cen + " " + right;}
 *  
 *  var pirateGreeting = partialComplete( wrap , "I'm", ", a mighty pirate!" );
 *  
 *  pirateGreeting("Guybrush Threepwood"); 
 *  // gives "I'm Guybrush Threepwood,a mighty pirate!"
 */
var partialComplete = varArgs(function( fn, args ) {

      // this isn't the shortest way to write this but it does
      // avoid creating a new array each time to pass to fn.apply,
      // otherwise could just call boundArgs.concat(callArgs)       

      var numBoundArgs = args.length;

      return varArgs(function( callArgs ) {
         
         for (var i = 0; i < callArgs.length; i++) {
            args[numBoundArgs + i] = callArgs[i];
         }
         
         args.length = numBoundArgs + callArgs.length;         
                     
         return fn.apply(this, args);
      }); 
   }),

/**
 * Compose zero or more functions:
 * 
 *    compose(f1, f2, f3)(x) = f1(f2(f3(x))))
 * 
 * The last (inner-most) function may take more than one parameter:
 * 
 *    compose(f1, f2, f3)(x,y) = f1(f2(f3(x,y))))
 */
   compose = varArgs(function(fns) {

      var fnsList = arrayAsList(fns);
   
      function next(params, curFn) {  
         return [apply(params, curFn)];   
      }
            
      return varArgs(function(startParams){
        
         return foldR(next, startParams, fnsList)[0];
      });
   });

/**
 * A more optimised version of compose that takes exactly two functions
 * @param f1
 * @param f2
 */
function compose2(f1, f2){
   return function(){
      return f1.call(this,f2.apply(this,arguments));
   }
}

/**
 * Generic form for a function to get a property from an object
 * 
 *    var o = {
 *       foo:'bar'
 *    }
 *    
 *    var getFoo = attr('foo')
 *    
 *    fetFoo(o) // returns 'bar'
 * 
 * @param {String} key the property name
 */
function attr(key) {
   return function(o) { return o[key]; };
}
        
/**
 * Call a list of functions with the same args until one returns a 
 * truthy result. Similar to the || operator.
 * 
 * So:
 *      lazyUnion([f1,f2,f3 ... fn])( p1, p2 ... pn )
 *      
 * Is equivalent to: 
 *      apply([p1, p2 ... pn], f1) || 
 *      apply([p1, p2 ... pn], f2) || 
 *      apply([p1, p2 ... pn], f3) ... apply(fn, [p1, p2 ... pn])  
 *  
 * @returns the first return value that is given that is truthy.
 */
   var lazyUnion = varArgs(function(fns) {

      return varArgs(function(params){
   
         var maybeValue;
   
         for (var i = 0; i < len(fns); i++) {
   
            maybeValue = apply(params, fns[i]);
   
            if( maybeValue ) {
               return maybeValue;
            }
         }
      });
   });   

/**
 * This file declares various pieces of functional programming.
 * 
 * This isn't a general purpose functional library, to keep things small it
 * has just the parts useful for Oboe.js.
 */


/**
 * Call a single function with the given arguments array.
 * Basically, a functional-style version of the OO-style Function#apply for 
 * when we don't care about the context ('this') of the call.
 * 
 * The order of arguments allows partial completion of the arguments array
 */
function apply(args, fn) {
   return fn.apply(undefined, args);
}

/**
 * Define variable argument functions but cut out all that tedious messing about 
 * with the arguments object. Delivers the variable-length part of the arguments
 * list as an array.
 * 
 * Eg:
 * 
 * var myFunction = varArgs(
 *    function( fixedArgument, otherFixedArgument, variableNumberOfArguments ){
 *       console.log( variableNumberOfArguments );
 *    }
 * )
 * 
 * myFunction('a', 'b', 1, 2, 3); // logs [1,2,3]
 * 
 * var myOtherFunction = varArgs(function( variableNumberOfArguments ){
 *    console.log( variableNumberOfArguments );
 * })
 * 
 * myFunction(1, 2, 3); // logs [1,2,3]
 * 
 */
function varArgs(fn){

   var numberOfFixedArguments = fn.length -1,
       slice = Array.prototype.slice;          
         
                   
   if( numberOfFixedArguments == 0 ) {
      // an optimised case for when there are no fixed args:   
   
      return function(){
         return fn.call(this, slice.call(arguments));
      }
      
   } else if( numberOfFixedArguments == 1 ) {
      // an optimised case for when there are is one fixed args:
   
      return function(){
         return fn.call(this, arguments[0], slice.call(arguments, 1));
      }
   }
   
   // general case   

   // we know how many arguments fn will always take. Create a
   // fixed-size array to hold that many, to be re-used on
   // every call to the returned function
   var argsHolder = Array(fn.length);   
                             
   return function(){
                            
      for (var i = 0; i < numberOfFixedArguments; i++) {
         argsHolder[i] = arguments[i];         
      }

      argsHolder[numberOfFixedArguments] = 
         slice.call(arguments, numberOfFixedArguments);
                                
      return fn.apply( this, argsHolder);      
   }       
}


/**
 * Swap the order of parameters to a binary function
 * 
 * A bit like this flip: http://zvon.org/other/haskell/Outputprelude/flip_f.html
 */
function flip(fn){
   return function(a, b){
      return fn(b,a);
   }
}


/**
 * Create a function which is the intersection of two other functions.
 * 
 * Like the && operator, if the first is truthy, the second is never called,
 * otherwise the return value from the second is returned.
 */
function lazyIntersection(fn1, fn2) {

   return function (param) {
                                                              
      return fn1(param) && fn2(param);
   };   
}

/**
 * A function which does nothing
 */
function noop(){}

/**
 * A function which is always happy
 */
function always(){return true}

/**
 * Create a function which always returns the same
 * value
 * 
 * var return3 = functor(3);
 * 
 * return3() // gives 3
 * return3() // still gives 3
 * return3() // will always give 3
 */
function functor(val){
   return function(){
      return val;
   }
}

/**
 * This file defines some loosely associated syntactic sugar for 
 * Javascript programming 
 */


/**
 * Returns true if the given candidate is of type T
 */
function isOfType(T, maybeSomething){
   return maybeSomething && maybeSomething.constructor === T;
}

var len = attr('length'),    
    isString = partialComplete(isOfType, String);

/** 
 * I don't like saying this:
 * 
 *    foo !=== undefined
 *    
 * because of the double-negative. I find this:
 * 
 *    defined(foo)
 *    
 * easier to read.
 */ 
function defined( value ) {
   return value !== undefined;
}

/**
 * Returns true if object o has a key named like every property in 
 * the properties array. Will give false if any are missing, or if o 
 * is not an object.
 */
function hasAllProperties(fieldList, o) {

   return      (o instanceof Object) 
            &&
               all(function (field) {         
                  return (field in o);         
               }, fieldList);
}
/**
 * Like cons in Lisp
 */
function cons(x, xs) {
   
   /* Internally lists are linked 2-element Javascript arrays.
          
      Ideally the return here would be Object.freeze([x,xs])
      so that bugs related to mutation are found fast.
      However, cons is right on the critical path for
      performance and this slows oboe-mark down by
      ~25%. Under theoretical future JS engines that freeze more
      efficiently (possibly even use immutability to
      run faster) this should be considered for
      restoration.
   */
   
   return [x,xs];
}

/**
 * The empty list
 */
var emptyList = null,

/**
 * Get the head of a list.
 * 
 * Ie, head(cons(a,b)) = a
 */
    head = attr(0),

/**
 * Get the tail of a list.
 * 
 * Ie, tail(cons(a,b)) = b
 */
    tail = attr(1);


/** 
 * Converts an array to a list 
 * 
 *    asList([a,b,c])
 * 
 * is equivalent to:
 *    
 *    cons(a, cons(b, cons(c, emptyList))) 
 **/
function arrayAsList(inputArray){

   return reverseList( 
      inputArray.reduce(
         flip(cons),
         emptyList 
      )
   );
}

/**
 * A varargs version of arrayAsList. Works a bit like list
 * in LISP.
 * 
 *    list(a,b,c) 
 *    
 * is equivalent to:
 * 
 *    cons(a, cons(b, cons(c, emptyList)))
 */
var list = varArgs(arrayAsList);

/**
 * Convert a list back to a js native array
 */
function listAsArray(list){

   return foldR( function(arraySoFar, listItem){
      
      arraySoFar.unshift(listItem);
      return arraySoFar;
           
   }, [], list );
   
}

/**
 * Map a function over a list 
 */
function map(fn, list) {

   return list
            ? cons(fn(head(list)), map(fn,tail(list)))
            : emptyList
            ;
}

/**
 * foldR implementation. Reduce a list down to a single value.
 * 
 * @pram {Function} fn     (rightEval, curVal) -> result 
 */
function foldR(fn, startValue, list) {
      
   return list 
            ? fn(foldR(fn, startValue, tail(list)), head(list))
            : startValue
            ;
}

/**
 * foldR implementation. Reduce a list down to a single value.
 * 
 * @pram {Function} fn     (rightEval, curVal) -> result 
 */
function foldR1(fn, list) {
      
   return tail(list) 
            ? fn(foldR1(fn, tail(list)), head(list))
            : head(list)
            ;
}


/**
 * Return a list like the one given but with the first instance equal 
 * to item removed 
 */
function without(list, test, removedFn) {
 
   return withoutInner(list, removedFn || noop);
 
   function withoutInner(subList, removedFn) {
      return subList  
         ?  ( test(head(subList)) 
                  ? (removedFn(head(subList)), tail(subList)) 
                  : cons(head(subList), withoutInner(tail(subList), removedFn))
            )
         : emptyList
         ;
   }               
}

/** 
 * Returns true if the given function holds for every item in 
 * the list, false otherwise 
 */
function all(fn, list) {
   
   return !list || 
          ( fn(head(list)) && all(fn, tail(list)) );
}

/**
 * Call every function in a list of functions with the same arguments
 * 
 * This doesn't make any sense if we're doing pure functional because 
 * it doesn't return anything. Hence, this is only really useful if the
 * functions being called have side-effects. 
 */
function applyEach(fnList, args) {

   if( fnList ) {  
      head(fnList).apply(null, args);
      
      applyEach(tail(fnList), args);
   }
}

/**
 * Reverse the order of a list
 */
function reverseList(list){ 

   // js re-implementation of 3rd solution from:
   //    http://www.haskell.org/haskellwiki/99_questions/Solutions/5
   function reverseInner( list, reversedAlready ) {
      if( !list ) {
         return reversedAlready;
      }
      
      return reverseInner(tail(list), cons(head(list), reversedAlready))
   }

   return reverseInner(list, emptyList);
}

function first(test, list) {
   return   list &&
               (test(head(list)) 
                  ? head(list) 
                  : first(test,tail(list))); 
}

/* 
   This is a slightly hacked-up browser only version of clarinet 
   
      *  some features removed to help keep browser Oboe under 
         the 5k micro-library limit
      *  plug directly into event bus
   
   For the original go here:
      https://github.com/dscape/clarinet

   We receive the events:
      STREAM_DATA
      STREAM_END
      
   We emit the events:
      SAX_KEY
      SAX_VALUE_OPEN
      SAX_VALUE_CLOSE      
      FAIL_EVENT      
 */

function clarinet(eventBus) {
  "use strict";
   
  var 
      // shortcut some events on the bus
      emitSaxKey           = eventBus(SAX_KEY).emit,
      emitValueOpen        = eventBus(SAX_VALUE_OPEN).emit,
      emitValueClose       = eventBus(SAX_VALUE_CLOSE).emit,
      emitFail             = eventBus(FAIL_EVENT).emit,
              
      MAX_BUFFER_LENGTH = 64 * 1024
  ,   stringTokenPattern = /[\\"\n]/g,_n=0 // states,BEGIN=_n++,VALUE=_n++ // general stuff,OPEN_OBJECT=_n++ //{,CLOSE_OBJECT=_n++ //},OPEN_ARRAY=_n++ // [,CLOSE_ARRAY=_n++ //],STRING=_n++ // "",OPEN_KEY=_n++ //,"a",CLOSE_KEY=_n++ // :,TRUE=_n++ // r,TRUE2=_n++ // u,TRUE3=_n++ // e,FALSE=_n++ // a,FALSE2=_n++ // l,FALSE3=_n++ // s,FALSE4=_n++ // e,NULL=_n++ // u,NULL2=_n++ // l,NULL3=_n++ // l,NUMBER_DECIMAL_POINT=_n++ // .,NUMBER_DIGIT=_n // [0-9] // setup initial parser values,bufferCheckPosition=MAX_BUFFER_LENGTH,latestError,c,p,textNode=undefined,numberNode="",slashed=false,closed=false,state=BEGIN,stack=[],unicodeS=null,unicodeI=0,depth=0,position=0,column=0 //mostly for error reporting,line=1;function checkBufferLength (){var maxActual=0;if (textNode !==undefined && textNode.length>MAX_BUFFER_LENGTH){emitError("Max buffer length exceeded: textNode");maxActual=Math.max(maxActual,textNode.length)}if (numberNode.length>MAX_BUFFER_LENGTH){emitError("Max buffer length exceeded: numberNode");maxActual=Math.max(maxActual,numberNode.length)}bufferCheckPosition=(MAX_BUFFER_LENGTH - maxActual) + position}eventBus(STREAM_DATA).on(handleData);eventBus(STREAM_END).on(handleStreamEnd);function emitError (errorString){if (textNode !==undefined){emitValueOpen(textNode);emitValueClose();textNode=undefined}latestError=Error(errorString + "\nLn: "+line+ "\nCol: "+column+ "\nChr: "+c);emitFail(errorReport(undefined,undefined,latestError))}function handleStreamEnd(){if(state==BEGIN){// Handle the case where the stream closes without ever receiving // any input. This isn't an error - response bodies can be blank,
      // particularly for 204 http responses
      
      // Because of how Oboe is currently implemented, we parse a
      // completely empty stream as containing an empty object.
      // This is because Oboe's done event is only fired when the // root object of the JSON stream closes. // This should be decoupled and attached instead to the input stream // from the http (or whatever) resource ending. // If this decoupling could happen the SAX parser could simply emit // zero events on a completely empty input. emitValueOpen({});emitValueClose();closed=true;return}if (state !==VALUE || depth !==0) emitError("Unexpected end");if (textNode !==undefined){emitValueOpen(textNode);emitValueClose();textNode=undefined}closed=true}function whitespace(c){return c=='\r' || c=='\n' || c==' ' || c=='\t'}function handleData (chunk){// this used to throw the error but inside Oboe we will have already // gotten the error when it was emitted. The important thing is to // not continue with the parse. if (latestError) return;if (closed){return emitError("Cannot write after close")}var i=0;c=chunk[0];while (c){p=c;c=chunk[i++];if(!c) break;position ++;if (c=="\n"){line ++;column=0}else column ++;switch (state){case BEGIN:if (c==="{") state=OPEN_OBJECT;else if (c==="[") state=OPEN_ARRAY;else if (!whitespace(c)) return emitError("Non-whitespace before {[.");continue;case OPEN_KEY:case OPEN_OBJECT:if (whitespace(c)) continue;if(state===OPEN_KEY) stack.push(CLOSE_KEY);else{if(c==='}'){emitValueOpen({});emitValueClose();state=stack.pop() || VALUE;continue}else stack.push(CLOSE_OBJECT)}if(c==='"') state=STRING;else return emitError("Malformed object key should start with \" ");continue;case CLOSE_KEY:case CLOSE_OBJECT:if (whitespace(c)) continue;if(c===':'){if(state===CLOSE_OBJECT){stack.push(CLOSE_OBJECT);if (textNode !==undefined){// was previously (in upstream Clarinet) one event // - object open came with the text of the first emitValueOpen({});emitSaxKey(textNode);textNode=undefined}depth++}else{if (textNode !==undefined){emitSaxKey(textNode);textNode=undefined}}state=VALUE}else if (c==='}'){if (textNode !==undefined){emitValueOpen(textNode);emitValueClose();textNode=undefined}emitValueClose();depth--;state=stack.pop() || VALUE}else if(c===','){if(state===CLOSE_OBJECT) stack.push(CLOSE_OBJECT);if (textNode !==undefined){emitValueOpen(textNode);emitValueClose();textNode=undefined}state=OPEN_KEY}else return emitError('Bad object');continue;case OPEN_ARRAY:// after an array there always a value case VALUE:if (whitespace(c)) continue;if(state===OPEN_ARRAY){emitValueOpen([]);depth++;state=VALUE;if(c===']'){emitValueClose();depth--;state=stack.pop() || VALUE;continue}else{stack.push(CLOSE_ARRAY)}}if(c==='"') state=STRING;else if(c==='{') state=OPEN_OBJECT;else if(c==='[') state=OPEN_ARRAY;else if(c==='t') state=TRUE;else if(c==='f') state=FALSE;else if(c==='n') state=NULL;else if(c==='-'){// keep and continue numberNode +=c}else if(c==='0'){numberNode +=c;state=NUMBER_DIGIT}else if('123456789'.indexOf(c) !==-1){numberNode +=c;state=NUMBER_DIGIT}else return emitError("Bad value");continue;case CLOSE_ARRAY:if(c===','){stack.push(CLOSE_ARRAY);if (textNode !==undefined){emitValueOpen(textNode);emitValueClose();textNode=undefined}state=VALUE}else if (c===']'){if (textNode !==undefined){emitValueOpen(textNode);emitValueClose();textNode=undefined}emitValueClose();depth--;state=stack.pop() || VALUE}else if (whitespace(c)) continue;else return emitError('Bad array');continue;case STRING:if (textNode===undefined){textNode=""}// thanks thejh,this is an about 50% performance improvement. var starti=i-1;STRING_BIGLOOP:while (true){// zero means "no unicode active". 1-4 mean "parse some more". end after 4. while (unicodeI>0){unicodeS +=c;c=chunk.charAt(i++);if (unicodeI===4){// TODO this might be slow? well,probably not used too often anyway textNode +=String.fromCharCode(parseInt(unicodeS,16));unicodeI=0;starti=i-1}else{unicodeI++}// we can just break here:no stuff we skipped that still has to be sliced out or so if (!c) break STRING_BIGLOOP}if (c==='"' && !slashed){state=stack.pop() || VALUE;textNode +=chunk.substring(starti,i-1);break}if (c==='\\' && !slashed){slashed=true;textNode +=chunk.substring(starti,i-1);c=chunk.charAt(i++);if (!c) break}if (slashed){slashed=false;if (c==='n'){textNode +='\n'}else if (c==='r'){textNode +='\r'}else if (c==='t'){textNode +='\t'}else if (c==='f'){textNode +='\f'}else if (c==='b'){textNode +='\b'}else if (c==='u'){// \uxxxx. meh! unicodeI=1;unicodeS=''}else{textNode +=c}c=chunk.charAt(i++);starti=i-1;if (!c) break;else continue}stringTokenPattern.lastIndex=i;var reResult=stringTokenPattern.exec(chunk);if (!reResult){i=chunk.length+1;textNode +=chunk.substring(starti,i-1);break}i=reResult.index+1;c=chunk.charAt(reResult.index);if (!c){textNode +=chunk.substring(starti,i-1);break}}continue;case TRUE:if (!c) continue;// strange buffers if (c==='r') state=TRUE2;else return emitError('Invalid true started with t'+ c);continue;case TRUE2:if (!c) continue;if (c==='u') state=TRUE3;else return emitError('Invalid true started with tr'+ c);continue;case TRUE3:if (!c) continue;if(c==='e'){emitValueOpen(true);emitValueClose();state=stack.pop() || VALUE}else return emitError('Invalid true started with tru'+ c);continue;case FALSE:if (!c) continue;if (c==='a') state=FALSE2;else return emitError('Invalid false started with f'+ c);continue;case FALSE2:if (!c) continue;if (c==='l') state=FALSE3;else return emitError('Invalid false started with fa'+ c);continue;case FALSE3:if (!c) continue;if (c==='s') state=FALSE4;else return emitError('Invalid false started with fal'+ c);continue;case FALSE4:if (!c) continue;if (c==='e'){emitValueOpen(false);emitValueClose();state=stack.pop() || VALUE}else return emitError('Invalid false started with fals'+ c);continue;case NULL:if (!c) continue;if (c==='u') state=NULL2;else return emitError('Invalid null started with n'+ c);continue;case NULL2:if (!c) continue;if (c==='l') state=NULL3;else return emitError('Invalid null started with nu'+ c);continue;case NULL3:if (!c) continue;if(c==='l'){emitValueOpen(null);emitValueClose();state=stack.pop() || VALUE}else return emitError('Invalid null started with nul'+ c);continue;case NUMBER_DECIMAL_POINT:if(c==='.'){numberNode +=c;state=NUMBER_DIGIT}else return emitError('Leading zero not followed by .');continue;case NUMBER_DIGIT:if('0123456789'.indexOf(c) !==-1) numberNode +=c;else if (c==='.'){if(numberNode.indexOf('.')!==-1) return emitError('Invalid number has two dots');numberNode +=c}else if (c==='e' || c==='E'){if(numberNode.indexOf('e')!==-1 || numberNode.indexOf('E')!==-1) return emitError('Invalid number has two exponential');numberNode +=c}else if (c==="+" || c==="-"){if(!(p==='e' || p==='E')) return emitError('Invalid symbol in number');numberNode +=c}else{if (numberNode){emitValueOpen(parseFloat(numberNode));emitValueClose();numberNode=""}i--;// go back one state=stack.pop() || VALUE}continue;default:return emitError("Unknown state: " + state)}}if (position>=bufferCheckPosition) checkBufferLength()}}function ascentManager(oboeBus,handlers){"use strict";,ascent;function stateAfter(handler){return function(param){ascent=handler(ascent,param)}}for(var eventName in handlers){oboeBus(eventName).on(stateAfter(handlers[eventName]),listenerId)}oboeBus(NODE_SWAP).on(function(newNode){var oldHead=head(ascent),key=keyOf(oldHead),ancestors=tail(ascent),parentNode;if(ancestors){parentNode=nodeOf(head(ancestors));parentNode[key]=newNode}});oboeBus(NODE_DROP).on(function(){var oldHead=head(ascent),key=keyOf(oldHead),ancestors=tail(ascent),parentNode;if(ancestors){parentNode=nodeOf(head(ancestors));delete parentNode[key]}});oboeBus(ABORTING).on(function(){for(var eventName in handlers){oboeBus(eventName).un(listenerId)}})}// based on gist https://gist.github.com/monsur/706839 function parseResponseHeaders(headerStr){var headers={};headerStr && headerStr.split('\u000d\u000a') .forEach(function(headerPair){// Can't use split() here because it does the wrong thing
         // if the header value has the string ": " in it.
         var index = headerPair.indexOf('\u003a\u0020');
         
         headers[headerPair.substring(0, index)] 
                     = headerPair.substring(index + 2);
      });
   
   return headers;
}

/**
 * Detect if a given URL is cross-origin in the scope of the
 * current page.
 * 
 * Browser only (since cross-origin has no meaning in Node.js)
 *
 * @param {Object} pageLocation - as in window.location
 * @param {Object} ajaxHost - an object like window.location describing the 
 *    origin of the url that we want to ajax in
 */
function isCrossOrigin(pageLocation, ajaxHost) {

   /*
    * NB: defaultPort only knows http and https.
    * Returns undefined otherwise.
    */
   function defaultPort(protocol) {
      return {'http:':80, 'https:':443}[protocol];
   }
   
   function portOf(location) {
      // pageLocation should always have a protocol. ajaxHost if no port or
      // protocol is specified, should use the port of the containing page
      
      return location.port || defaultPort(location.protocol||pageLocation.protocol);
   }

   // if ajaxHost doesn't give a domain,port is the same as pageLocation // it can't give a protocol but not a domain
   // it can't give a port but not a domain return !!((ajaxHost.protocol && (ajaxHost.protocol !=pageLocation.protocol)) || (ajaxHost.host && (ajaxHost.host !=pageLocation.host)) || (ajaxHost.host && (portOf(ajaxHost) !=portOf(pageLocation))))}function parseUrlOrigin(url){// url could be domain-relative // url could give a domain // cross origin means:// same domain // same port // some protocol // so,same everything up to the first (single) slash // if such is given // // can ignore everything after that var URL_HOST_PATTERN=/(\w+:)?(?:\/\/)([\w.-]+)?(?::(\d+))?\/?/,// if no match,use an empty array so that // subexpressions 1,2,3 are all undefined // and will ultimately return all empty // strings as the parse result:urlHostMatch=URL_HOST_PATTERN.exec(url) || [];return{protocol:urlHostMatch[1] || '',host:urlHostMatch[2] || '',port:urlHostMatch[3] || ''}}function httpTransport(){return new XMLHttpRequest()}function streamingHttp(oboeBus,xhr,method,url,data,headers,withCredentials){"use strict";var emitStreamData=oboeBus(STREAM_DATA).emit,emitFail=oboeBus(FAIL_EVENT).emit,numberOfCharsAlreadyGivenToCallback=0,stillToSendStartEvent=true;// When an ABORTING message is put on the event bus abort // the ajax request oboeBus(ABORTING).on(function(){// if we keep the onreadystatechange while aborting the XHR gives // a callback like a successful call so first remove this listener // by assigning null:xhr.onreadystatechange=null;xhr.abort()});function handleProgress(){var textSoFar=xhr.responseText,newText=textSoFar.substr(numberOfCharsAlreadyGivenToCallback);if(newText){emitStreamData(newText)}numberOfCharsAlreadyGivenToCallback=len(textSoFar)}if('onprogress' in xhr){// detect browser support for progressive delivery xhr.onprogress=handleProgress}xhr.onreadystatechange=function(){function sendStartIfNotAlready(){// Internet Explorer is very unreliable as to when xhr.status etc can // be read so has to be protected with try/catch and tried again on // the next readyState if it fails try{stillToSendStartEvent && oboeBus(HTTP_START).emit(xhr.status,parseResponseHeaders(xhr.getAllResponseHeaders()));stillToSendStartEvent=false}}switch(xhr.readyState){case 2:// HEADERS_RECEIVED case 3:// LOADING return sendStartIfNotAlready();case 4:// DONE sendStartIfNotAlready();// if xhr.status hasn't been available yet, it must be NOW, huh IE?
            
            // is this a 2xx http code?
            var successful = String(xhr.status)[0] == 2;
            
            if( successful ) {
               // In Chrome 29 (not 28) no onprogress is emitted when a response
               // is complete before the onload. We need to always do handleInput
               // in case we get the load but have not had a final progress event.
               // This looks like a bug and may change in future but let's take // the safest approach and assume we might not have received a // progress event for each part of the response handleProgress();oboeBus(STREAM_END).emit()}else{emitFail(errorReport(xhr.status,xhr.responseText))}}};try{xhr.open(method,url,true);for(var headerName in headers){xhr.setRequestHeader(headerName,headers[headerName])}if(!isCrossOrigin(window.location,parseUrlOrigin(url))){xhr.setRequestHeader('X-Requested-With','XMLHttpRequest')}xhr.withCredentials=withCredentials;xhr.send(data)}catch(e){// To keep a consistent interface with Node,we can't emit an event here.
      // Node's streaming http adaptor receives the error as an asynchronous // event rather than as an exception. If we emitted now,the Oboe user // has had no chance to add a .fail listener so there is no way // the event could be useful. For both these reasons defer the // firing to the next JS frame. window.setTimeout(partialComplete(emitFail,errorReport(undefined,undefined,e)),0)}}var jsonPathSyntax=(function(){var regexDescriptor=function regexDescriptor(regex){return regex.exec.bind(regex)},jsonPathClause=varArgs(function(componentRegexes){// The regular expressions all start with ^ because we // only want to find matches at the start of the // JSONPath fragment we are inspecting componentRegexes.unshift(/^/);return regexDescriptor(RegExp(componentRegexes.map(attr('source')).join('')))}),possiblyCapturing=/(\$?)/,namedNode=/([\w-_]+|\*)/,namePlaceholder=/()/,nodeInArrayNotation=/\["([^"]+)"\]/
   ,   numberedNodeInArrayNotation = /\[(\d+|\*)\]/
   ,   fieldList =                      /{([\w ]*?)}/
   ,   optionalFieldList =           /(?:{([\w ]*?)})?/
    

       //   foo or *                  
   ,   jsonPathNamedNodeInObjectNotation   = jsonPathClause( 
                                                possiblyCapturing, 
                                                namedNode, 
                                                optionalFieldList
                                             )
                                             
       //   ["foo"]   
   ,   jsonPathNamedNodeInArrayNotation    = jsonPathClause( 
                                                possiblyCapturing, 
                                                nodeInArrayNotation, 
                                                optionalFieldList
                                             )  

       //   [2] or [*]       
   ,   jsonPathNumberedNodeInArrayNotation = jsonPathClause( 
                                                possiblyCapturing, 
                                                numberedNodeInArrayNotation, 
                                                optionalFieldList
                                             )

       //   {a b c}      
   ,   jsonPathPureDuckTyping              = jsonPathClause( 
                                                possiblyCapturing, 
                                                namePlaceholder, 
                                                fieldList
                                             )
   
       //   ..
   ,   jsonPathDoubleDot                   = jsonPathClause(/\.\./)                  
   
       //   .
   ,   jsonPathDot                         = jsonPathClause(/\./)                    
   
       //   !
   ,   jsonPathBang                        = jsonPathClause(
                                                possiblyCapturing, 
                                                /!/
                                             )  
   
       //   nada!
   ,   emptyString                         = jsonPathClause(/$/)                     
   
   ;
   
  
   /* We export only a single function. When called, this function injects 
      into another function the descriptors from above.             
    */
   return function (fn){      
      return fn(      
         lazyUnion(
            jsonPathNamedNodeInObjectNotation
         ,  jsonPathNamedNodeInArrayNotation
         ,  jsonPathNumberedNodeInArrayNotation
         ,  jsonPathPureDuckTyping 
         )
      ,  jsonPathDoubleDot
      ,  jsonPathDot
      ,  jsonPathBang
      ,  emptyString 
      );
   }; 

}());
/**
 * Get a new key->node mapping
 * 
 * @param {String|Number} key
 * @param {Object|Array|String|Number|null} node a value found in the json
 */
function namedNode(key, node) {
   return {key:key, node:node};
}

/** get the key of a namedNode */
var keyOf = attr('key');

/** get the node from a namedNode */
var nodeOf = attr('node');
/** 
 * This file provides various listeners which can be used to build up
 * a changing ascent based on the callbacks provided by Clarinet. It listens
 * to the low-level events from Clarinet and emits higher-level ones.
 *  
 * The building up is stateless so to track a JSON file
 * ascentManager.js is required to store the ascent state
 * between calls.
 */



/** 
 * A special value to use in the path list to represent the path 'to' a root 
 * object (which doesn't really have any path). This prevents the need for 
 * special-casing detection of the root object and allows it to be treated 
 * like any other object. We might think of this as being similar to the 
 * 'unnamed root' domain ".", eg if I go to 
 * http://en.wikipedia.org./wiki/En/Main_page the dot after 'org' deliminates 
 * the unnamed root of the DNS.
 * 
 * This is kept as an object to take advantage that in Javascript's OO objects 
 * are guaranteed to be distinct, therefore no other object can possibly clash 
 * with this one. Strings, numbers etc provide no such guarantee. 
 **/
var ROOT_PATH = {};


/**
 * Create a new set of handlers for clarinet's events, bound to the emit 
 * function given.  
 */ 
function incrementalContentBuilder( oboeBus ) {

   var emitNodeOpened = oboeBus(NODE_OPENED).emit,
       emitNodeClosed = oboeBus(NODE_CLOSED).emit,
       emitRootOpened = oboeBus(ROOT_PATH_FOUND).emit,
       emitRootClosed = oboeBus(ROOT_NODE_FOUND).emit;

   function arrayIndicesAreKeys( possiblyInconsistentAscent, newDeepestNode) {
   
      /* for values in arrays we aren't pre-warned of the coming paths 
         (Clarinet gives no call to onkey like it does for values in objects) 
         so if we are in an array we need to create this path ourselves. The 
         key will be len(parentNode) because array keys are always sequential 
         numbers. */

      var parentNode = nodeOf( head( possiblyInconsistentAscent));
      
      return      isOfType( Array, parentNode)
               ?
                  keyFound(  possiblyInconsistentAscent, 
                              len(parentNode), 
                              newDeepestNode
                  )
               :  
                  // nothing needed, return unchanged
                  possiblyInconsistentAscent 
               ;
   }
                 
   function nodeOpened( ascent, newDeepestNode ) {
      
      if( !ascent ) {
         // we discovered the root node,         
         emitRootOpened( newDeepestNode);
                    
         return keyFound( ascent, ROOT_PATH, newDeepestNode);         
      }

      // we discovered a non-root node
                 
      var arrayConsistentAscent  = arrayIndicesAreKeys( ascent, newDeepestNode),      
          ancestorBranches       = tail( arrayConsistentAscent),
          previouslyUnmappedName = keyOf( head( arrayConsistentAscent));
          
      appendBuiltContent( 
         ancestorBranches, 
         previouslyUnmappedName, 
         newDeepestNode 
      );
                                                                                                         
      return cons( 
               namedNode( previouslyUnmappedName, newDeepestNode ), 
               ancestorBranches
      );                                                                          
   }


   /**
    * Add a new value to the object we are building up to represent the
    * parsed JSON
    */
   function appendBuiltContent( ancestorBranches, key, node ){
     
      nodeOf( head( ancestorBranches))[key] = node;
   }

     
   /**
    * For when we find a new key in the json.
    * 
    * @param {String|Number|Object} newDeepestName the key. If we are in an 
    *    array will be a number, otherwise a string. May take the special 
    *    value ROOT_PATH if the root node has just been found
    *    
    * @param {String|Number|Object|Array|Null|undefined} [maybeNewDeepestNode] 
    *    usually this won't be known so can be undefined. Can't use null 
    *    to represent unknown because null is a valid value in JSON
    **/  
   function keyFound(ascent, newDeepestName, maybeNewDeepestNode) {

      if( ascent ) { // if not root
      
         // If we have the key but (unless adding to an array) no known value
         // yet. Put that key in the output but against no defined value:      
         appendBuiltContent( ascent, newDeepestName, maybeNewDeepestNode );
      }
   
      var ascentWithNewPath = cons( 
                                 namedNode( newDeepestName, 
                                            maybeNewDeepestNode), 
                                 ascent
                              );

      emitNodeOpened( ascentWithNewPath);
 
      return ascentWithNewPath;
   }


   /**
    * For when the current node ends.
    */
   function nodeClosed( ascent ) {

      emitNodeClosed( ascent);
       
      return tail( ascent) ||
             // If there are no nodes left in the ascent the root node
             // just closed. Emit a special event for this: 
             emitRootClosed(nodeOf(head(ascent)));
   }      

   var contentBuilderHandlers = {};
   contentBuilderHandlers[SAX_VALUE_OPEN] = nodeOpened;
   contentBuilderHandlers[SAX_VALUE_CLOSE] = nodeClosed;
   contentBuilderHandlers[SAX_KEY] = keyFound;
   return contentBuilderHandlers;
}

/**
 * The jsonPath evaluator compiler used for Oboe.js. 
 * 
 * One function is exposed. This function takes a String JSONPath spec and 
 * returns a function to test candidate ascents for matches.
 * 
 *  String jsonPath -> (List ascent) -> Boolean|Object
 *
 * This file is coded in a pure functional style. That is, no function has 
 * side effects, every function evaluates to the same value for the same 
 * arguments and no variables are reassigned.
 */  
// the call to jsonPathSyntax injects the token syntaxes that are needed 
// inside the compiler
var jsonPathCompiler = jsonPathSyntax(function (pathNodeSyntax, 
                                                doubleDotSyntax, 
                                                dotSyntax,
                                                bangSyntax,
                                                emptySyntax ) {

   var CAPTURING_INDEX = 1;
   var NAME_INDEX = 2;
   var FIELD_LIST_INDEX = 3;

   var headKey  = compose2(keyOf, head),
       headNode = compose2(nodeOf, head);
                   
   /**
    * Create an evaluator function for a named path node, expressed in the
    * JSONPath like:
    *    foo
    *    ["bar"]
    *    [2]   
    */
   function nameClause(previousExpr, detection ) {
     
      var name = detection[NAME_INDEX],
            
          matchesName = ( !name || name == '*' ) 
                           ?  always
                           :  function(ascent){return headKey(ascent) == name};
     

      return lazyIntersection(matchesName, previousExpr);
   }

   /**
    * Create an evaluator function for a a duck-typed node, expressed like:
    * 
    *    {spin, taste, colour}
    *    .particle{spin, taste, colour}
    *    *{spin, taste, colour}
    */
   function duckTypeClause(previousExpr, detection) {

      var fieldListStr = detection[FIELD_LIST_INDEX];

      if (!fieldListStr) 
         return previousExpr; // don't wrap at all, return given expr as-is      

      var hasAllrequiredFields = partialComplete(
                                    hasAllProperties, 
                                    arrayAsList(fieldListStr.split(/\W+/))
                                 ),
                                 
          isMatch =  compose2( 
                        hasAllrequiredFields, 
                        headNode
                     );

      return lazyIntersection(isMatch, previousExpr);
   }

   /**
    * Expression for $, returns the evaluator function
    */
   function capture( previousExpr, detection ) {

      // extract meaning from the detection      
      var capturing = !!detection[CAPTURING_INDEX];

      if (!capturing)          
         return previousExpr; // don't wrap at all, return given expr as-is      
      
      return lazyIntersection(previousExpr, head);
            
   }            
      
   /**
    * Create an evaluator function that moves onto the next item on the 
    * lists. This function is the place where the logic to move up a 
    * level in the ascent exists. 
    * 
    * Eg, for JSONPath ".foo" we need skip1(nameClause(always, [,'foo']))
    */
   function skip1(previousExpr) {
   
   
      if( previousExpr == always ) {
         /* If there is no previous expression this consume command 
            is at the start of the jsonPath.
            Since JSONPath specifies what we'd like to find but not 
            necessarily everything leading down to it, when running
            out of JSONPath to check against we default to true */
         return always;
      }

      /** return true if the ascent we have contains only the JSON root,
       *  false otherwise
       */
      function notAtRoot(ascent){
         return headKey(ascent) != ROOT_PATH;
      }
      
      return lazyIntersection(
               /* If we're already at the root but there are more 
                  expressions to satisfy, can't consume any more. No match.

                  This check is why none of the other exprs have to be able 
                  to handle empty lists; skip1 is the only evaluator that 
                  moves onto the next token and it refuses to do so once it 
                  reaches the last item in the list. */
               notAtRoot,
               
               /* We are not at the root of the ascent yet.
                  Move to the next level of the ascent by handing only 
                  the tail to the previous expression */ 
               compose2(previousExpr, tail) 
      );
                                                                                                               
   }   
   
   /**
    * Create an evaluator function for the .. (double dot) token. Consumes
    * zero or more levels of the ascent, the fewest that are required to find
    * a match when given to previousExpr.
    */   
   function skipMany(previousExpr) {

      if( previousExpr == always ) {
         /* If there is no previous expression this consume command 
            is at the start of the jsonPath.
            Since JSONPath specifies what we'd like to find but not 
            necessarily everything leading down to it, when running
            out of JSONPath to check against we default to true */            
         return always;
      }
          
      var 
          // In JSONPath .. is equivalent to !.. so if .. reaches the root
          // the match has succeeded. Ie, we might write ..foo or !..foo
          // and both should match identically.
          terminalCaseWhenArrivingAtRoot = rootExpr(),
          terminalCaseWhenPreviousExpressionIsSatisfied = previousExpr,
          recursiveCase = skip1(function(ascent) {
             return cases(ascent);
          }),

          cases = lazyUnion(
                     terminalCaseWhenArrivingAtRoot
                  ,  terminalCaseWhenPreviousExpressionIsSatisfied
                  ,  recursiveCase  
                  );
      
      return cases;
   }      
   
   /**
    * Generate an evaluator for ! - matches only the root element of the json
    * and ignores any previous expressions since nothing may precede !. 
    */   
   function rootExpr() {
      
      return function(ascent){
         return headKey(ascent) == ROOT_PATH;
      };
   }   
         
   /**
    * Generate a statement wrapper to sit around the outermost 
    * clause evaluator.
    * 
    * Handles the case where the capturing is implicit because the JSONPath
    * did not contain a '$' by returning the last node.
    */   
   function statementExpr(lastClause) {
      
      return function(ascent) {
   
         // kick off the evaluation by passing through to the last clause
         var exprMatch = lastClause(ascent);
                                                     
         return exprMatch === true ? head(ascent) : exprMatch;
      };
   }      
                          
   /**
    * For when a token has been found in the JSONPath input.
    * Compiles the parser for that token and returns in combination with the
    * parser already generated.
    * 
    * @param {Function} exprs  a list of the clause evaluator generators for
    *                          the token that was found
    * @param {Function} parserGeneratedSoFar the parser already found
    * @param {Array} detection the match given by the regex engine when 
    *                          the feature was found
    */
   function expressionsReader( exprs, parserGeneratedSoFar, detection ) {
                     
      // if exprs is zero-length foldR will pass back the 
      // parserGeneratedSoFar as-is so we don't need to treat 
      // this as a special case
      
      return   foldR( 
                  function( parserGeneratedSoFar, expr ){
         
                     return expr(parserGeneratedSoFar, detection);
                  }, 
                  parserGeneratedSoFar, 
                  exprs
               );                     

   }

   /** 
    *  If jsonPath matches the given detector function, creates a function which
    *  evaluates against every clause in the clauseEvaluatorGenerators. The
    *  created function is propagated to the onSuccess function, along with
    *  the remaining unparsed JSONPath substring.
    *  
    *  The intended use is to create a clauseMatcher by filling in
    *  the first two arguments, thus providing a function that knows
    *  some syntax to match and what kind of generator to create if it
    *  finds it. The parameter list once completed is:
    *  
    *    (jsonPath, parserGeneratedSoFar, onSuccess)
    *  
    *  onSuccess may be compileJsonPathToFunction, to recursively continue 
    *  parsing after finding a match or returnFoundParser to stop here.
    */
   function generateClauseReaderIfTokenFound (
     
                        tokenDetector, clauseEvaluatorGenerators,
                         
                        jsonPath, parserGeneratedSoFar, onSuccess) {
                        
      var detected = tokenDetector(jsonPath);

      if(detected) {
         var compiledParser = expressionsReader(
                                 clauseEvaluatorGenerators, 
                                 parserGeneratedSoFar, 
                                 detected
                              ),
         
             remainingUnparsedJsonPath = jsonPath.substr(len(detected[0]));                
                               
         return onSuccess(remainingUnparsedJsonPath, compiledParser);
      }         
   }
                 
   /**
    * Partially completes generateClauseReaderIfTokenFound above. 
    */
   function clauseMatcher(tokenDetector, exprs) {
        
      return   partialComplete( 
                  generateClauseReaderIfTokenFound, 
                  tokenDetector, 
                  exprs 
               );
   }

   /**
    * clauseForJsonPath is a function which attempts to match against 
    * several clause matchers in order until one matches. If non match the
    * jsonPath expression is invalid and an error is thrown.
    * 
    * The parameter list is the same as a single clauseMatcher:
    * 
    *    (jsonPath, parserGeneratedSoFar, onSuccess)
    */     
   var clauseForJsonPath = lazyUnion(

      clauseMatcher(pathNodeSyntax   , list( capture, 
                                             duckTypeClause, 
                                             nameClause, 
                                             skip1 ))
                                                     
   ,  clauseMatcher(doubleDotSyntax  , list( skipMany))
       
       // dot is a separator only (like whitespace in other languages) but 
       // rather than make it a special case, use an empty list of 
       // expressions when this token is found
   ,  clauseMatcher(dotSyntax        , list() )  
                                                                                      
   ,  clauseMatcher(bangSyntax       , list( capture,
                                             rootExpr))
                                                          
   ,  clauseMatcher(emptySyntax      , list( statementExpr))
   
   ,  function (jsonPath) {
         throw Error('"' + jsonPath + '" could not be tokenised')      
      }
   );


   /**
    * One of two possible values for the onSuccess argument of 
    * generateClauseReaderIfTokenFound.
    * 
    * When this function is used, generateClauseReaderIfTokenFound simply 
    * returns the compiledParser that it made, regardless of if there is 
    * any remaining jsonPath to be compiled.
    */
   function returnFoundParser(_remainingJsonPath, compiledParser){ 
      return compiledParser 
   }     
              
   /**
    * Recursively compile a JSONPath expression.
    * 
    * This function serves as one of two possible values for the onSuccess 
    * argument of generateClauseReaderIfTokenFound, meaning continue to
    * recursively compile. Otherwise, returnFoundParser is given and
    * compilation terminates.
    */
   function compileJsonPathToFunction( uncompiledJsonPath, 
                                       parserGeneratedSoFar ) {

      /**
       * On finding a match, if there is remaining text to be compiled
       * we want to either continue parsing using a recursive call to 
       * compileJsonPathToFunction. Otherwise, we want to stop and return 
       * the parser that we have found so far.
       */
      var onFind =      uncompiledJsonPath
                     ?  compileJsonPathToFunction 
                     :  returnFoundParser;
                   
      return   clauseForJsonPath( 
                  uncompiledJsonPath, 
                  parserGeneratedSoFar, 
                  onFind
               );                              
   }

   /**
    * This is the function that we expose to the rest of the library.
    */
   return function(jsonPath){
        
      try {
         // Kick off the recursive parsing of the jsonPath 
         return compileJsonPathToFunction(jsonPath, always);
         
      } catch( e ) {
         throw Error( 'Could not compile "' + jsonPath + 
                      '" because ' + e.message
         );
      }
   }

});

/** 
 * A pub/sub which is responsible for a single event type. A 
 * multi-event type event bus is created by pubSub by collecting
 * several of these.
 * 
 * @param {String} eventType                   
 *    the name of the events managed by this singleEventPubSub
 * @param {singleEventPubSub} [newListener]    
 *    place to notify of new listeners
 * @param {singleEventPubSub} [removeListener] 
 *    place to notify of when listeners are removed
 */
function singleEventPubSub(eventType, newListener, removeListener){

   /** we are optimised for emitting events over firing them.
    *  As well as the tuple list which stores event ids and
    *  listeners there is a list with just the listeners which 
    *  can be iterated more quickly when we are emitting
    */
   var listenerTupleList,
       listenerList;

   function hasId(id){
      return function(tuple) {
         return tuple.id == id;      
      };  
   }
              
   return {

      /**
       * @param {Function} listener
       * @param {*} listenerId 
       *    an id that this listener can later by removed by. 
       *    Can be of any type, to be compared to other ids using ==
       */
      on:function( listener, listenerId ) {
         
         var tuple = {
            listener: listener
         ,  id:       listenerId || listener // when no id is given use the
                                             // listener function as the id
         };

         if( newListener ) {
            newListener.emit(eventType, listener, tuple.id);
         }
         
         listenerTupleList = cons( tuple,    listenerTupleList );
         listenerList      = cons( listener, listenerList      );

         return this; // chaining
      },
     
      emit:function () {                                                                                           
         applyEach( listenerList, arguments );
      },
      
      un: function( listenerId ) {
             
         var removed;             
              
         listenerTupleList = without(
            listenerTupleList,
            hasId(listenerId),
            function(tuple){
               removed = tuple;
            }
         );    
         
         if( removed ) {
            listenerList = without( listenerList, function(listener){
               return listener == removed.listener;
            });
         
            if( removeListener ) {
               removeListener.emit(eventType, removed.listener, removed.id);
            }
         }
      },
      
      listeners: function(){
         // differs from Node EventEmitter: returns list, not array
         return listenerList;
      },
      
      hasListener: function(listenerId){
         var test = listenerId? hasId(listenerId) : always;
      
         return defined(first( test, listenerTupleList));
      }
   };
}
/**
 * pubSub is a curried interface for listening to and emitting
 * events.
 * 
 * If we get a bus:
 *    
 *    var bus = pubSub();
 * 
 * We can listen to event 'foo' like:
 * 
 *    bus('foo').on(myCallback)
 *    
 * And emit event foo like:
 * 
 *    bus('foo').emit()
 *    
 * or, with a parameter:
 * 
 *    bus('foo').emit('bar')
 *     
 * All functions can be cached and don't need to be 
 * bound. Ie:
 * 
 *    var fooEmitter = bus('foo').emit
 *    fooEmitter('bar');  // emit an event
 *    fooEmitter('baz');  // emit another
 *    
 * There's also an uncurried[1] shortcut for .emit and .on:
 * 
 *    bus.on('foo', callback)
 *    bus.emit('foo', 'bar')
 * 
 * [1]: http://zvon.org/other/haskell/Outputprelude/uncurry_f.html
 */
function pubSub(){

   var singles = {},
       newListener = newSingle('newListener'),
       removeListener = newSingle('removeListener'); 
      
   function newSingle(eventName) {
      return singles[eventName] = singleEventPubSub(
         eventName, 
         newListener, 
         removeListener
      );   
   }      

   /** pubSub instances are functions */
   function pubSubInstance( eventName ){   
      
      return singles[eventName] || newSingle( eventName );   
   }

   // add convenience EventEmitter-style uncurried form of 'emit' and 'on'
   ['emit', 'on', 'un'].forEach(function(methodName){
   
      pubSubInstance[methodName] = varArgs(function(eventName, parameters){
         apply( parameters, pubSubInstance( eventName )[methodName]);
      });   
   });
         
   return pubSubInstance;
}

/**
 * This file declares some constants to use as names for event types.
 */

var // the events which are never exported are kept as 
    // the smallest possible representation, in numbers:
    _S = 1,

    // fired whenever a new node starts in the JSON stream:
    NODE_OPENED     = _S++,

    // fired whenever a node closes in the JSON stream:
    NODE_CLOSED     = _S++,

    // called if a .node callback returns a value - 
    NODE_SWAP       = _S++,
    NODE_DROP       = _S++,

    FAIL_EVENT      = 'fail',
   
    ROOT_NODE_FOUND = _S++,
    ROOT_PATH_FOUND = _S++,
   
    HTTP_START      = 'start',
    STREAM_DATA     = 'data',
    STREAM_END      = 'end',
    ABORTING        = _S++,

    // SAX events butchered from Clarinet
    SAX_KEY          = _S++,
    SAX_VALUE_OPEN   = _S++,
    SAX_VALUE_CLOSE  = _S++;
    
function errorReport(statusCode, body, error) {
   try{
      var jsonBody = JSON.parse(body);
   }catch(e){}

   return {
      statusCode:statusCode,
      body:body,
      jsonBody:jsonBody,
      thrown:error
   };
}    

/** 
 *  The pattern adaptor listens for newListener and removeListener
 *  events. When patterns are added or removed it compiles the JSONPath
 *  and wires them up.
 *  
 *  When nodes and paths are found it emits the fully-qualified match 
 *  events with parameters ready to ship to the outside world
 */

function patternAdapter(oboeBus, jsonPathCompiler) {

   var predicateEventMap = {
      node:oboeBus(NODE_CLOSED)
   ,  path:oboeBus(NODE_OPENED)
   };
     
   function emitMatchingNode(emitMatch, node, ascent) {
         
      /* 
         We're now calling to the outside world where Lisp-style 
         lists will not be familiar. Convert to standard arrays. 
   
         Also, reverse the order because it is more common to 
         list paths "root to leaf" than "leaf to root"  */
      var descent     = reverseList(ascent);
                
      emitMatch(
         node,
         
         // To make a path, strip off the last item which is the special
         // ROOT_PATH token for the 'path' to the root node          
         listAsArray(tail(map(keyOf,descent))),  // path
         listAsArray(map(nodeOf, descent))       // ancestors    
      );         
   }

   /* 
    * Set up the catching of events such as NODE_CLOSED and NODE_OPENED and, if 
    * matching the specified pattern, propagate to pattern-match events such as 
    * oboeBus('node:!')
    * 
    * 
    * 
    * @param {Function} predicateEvent 
    *          either oboeBus(NODE_CLOSED) or oboeBus(NODE_OPENED).
    * @param {Function} compiledJsonPath          
    */
   function addUnderlyingListener( fullEventName, predicateEvent, compiledJsonPath ){
   
      var emitMatch = oboeBus(fullEventName).emit;
   
      predicateEvent.on( function (ascent) {

         var maybeMatchingMapping = compiledJsonPath(ascent);

         /* Possible values for maybeMatchingMapping are now:

          false: 
          we did not match 

          an object/array/string/number/null: 
          we matched and have the node that matched.
          Because nulls are valid json values this can be null.

          undefined:
          we matched but don't have the matching node yet.
          ie, we know there is an upcoming node that matches but we 
          can't say anything else about it. 
          */
         if (maybeMatchingMapping !== false) {

            emitMatchingNode(
               emitMatch, 
               nodeOf(maybeMatchingMapping), 
               ascent
            );
         }
      }, fullEventName);
     
      oboeBus('removeListener').on( function(removedEventName){

         // if the fully qualified match event listener is later removed, clean up 
         // by removing the underlying listener if it was the last using that pattern:
      
         if( removedEventName == fullEventName ) {
         
            if( !oboeBus(removedEventName).listeners(  )) {
               predicateEvent.un( fullEventName );
            }
         }
      });   
   }

   oboeBus('newListener').on( function(fullEventName){

      var match = /(node|path):(.*)/.exec(fullEventName);
      
      if( match ) {
         var predicateEvent = predicateEventMap[match[1]];
                    
         if( !predicateEvent.hasListener( fullEventName) ) {  
                  
            addUnderlyingListener(
               fullEventName,
               predicateEvent, 
               jsonPathCompiler( match[2] )
            );
         }
      }    
   })

}

/**
 * The instance API is the thing that is returned when oboe() is called.
 * it allows:
 *
 *    - listeners for various events to be added and removed
 *    - the http response header/headers to be read
 */
function instanceApi(oboeBus, contentSource){

   var oboeApi,
       fullyQualifiedNamePattern = /^(node|path):./,
       rootNodeFinishedEvent = oboeBus(ROOT_NODE_FOUND),
       emitNodeDrop = oboeBus(NODE_DROP).emit,
       emitNodeSwap = oboeBus(NODE_SWAP).emit,

       /**
        * Add any kind of listener that the instance api exposes
        */
       addListener = varArgs(function( eventId, parameters ){

            if( oboeApi[eventId] ) {

               // for events added as .on(event, callback), if there is a
               // .event() equivalent with special behaviour , pass through
               // to that:
               apply(parameters, oboeApi[eventId]);
            } else {

               // we have a standard Node.js EventEmitter 2-argument call.
               // The first parameter is the listener.
               var event = oboeBus(eventId),
                   listener = parameters[0];

               if( fullyQualifiedNamePattern.test(eventId) ) {

                  // allow fully-qualified node/path listeners
                  // to be added
                  addForgettableCallback(event, listener);
               } else  {

                  // the event has no special handling, pass through
                  // directly onto the event bus:
                  event.on( listener);
               }
            }

            return oboeApi; // chaining
       }),

       /**
        * Remove any kind of listener that the instance api exposes
        */
       removeListener = function( eventId, p2, p3 ){

            if( eventId == 'done' ) {

               rootNodeFinishedEvent.un(p2);

            } else if( eventId == 'node' || eventId == 'path' ) {

               // allow removal of node and path
               oboeBus.un(eventId + ':' + p2, p3);
            } else {

               // we have a standard Node.js EventEmitter 2-argument call.
               // The second parameter is the listener. This may be a call
               // to remove a fully-qualified node/path listener but requires
               // no special handling
               var listener = p2;

               oboeBus(eventId).un(listener);
            }

            return oboeApi; // chaining
       };

   /**
    * Add a callback, wrapped in a try/catch so as to not break the
    * execution of Oboe if an exception is thrown (fail events are
    * fired instead)
    *
    * The callback is used as the listener id so that it can later be
    * removed using .un(callback)
    */
   function addProtectedCallback(eventName, callback) {
      oboeBus(eventName).on(protectedCallback(callback), callback);
      return oboeApi; // chaining
   }

   /**
    * Add a callback where, if .forget() is called during the callback's
    * execution, the callback will be de-registered
    */
   function addForgettableCallback(event, callback, listenerId) {

      // listenerId is optional and if not given, the original
      // callback will be used
      listenerId = listenerId || callback;

      var safeCallback = protectedCallback(callback);

      event.on( function() {

         var discard = false;

         oboeApi.forget = function(){
            discard = true;
         };

         apply( arguments, safeCallback );

         delete oboeApi.forget;

         if( discard ) {
            event.un(listenerId);
         }
      }, listenerId);

      return oboeApi; // chaining
   }

   /**
    *  wrap a callback so that if it throws, Oboe.js doesn't crash but instead
    *  throw the error in another event loop
    */
   function protectedCallback( callback ) {
      return function() {
         try{
            return callback.apply(oboeApi, arguments);
         }catch(e)  {
            setTimeout(function() {
              throw e;
            });
         }
      }
   }

   /**
    * Return the fully qualified event for when a pattern matches
    * either a node or a path
    *
    * @param type {String} either 'node' or 'path'
    */
   function fullyQualifiedPatternMatchEvent(type, pattern) {
      return oboeBus(type + ':' + pattern);
   }

   function wrapCallbackToSwapNodeIfSomethingReturned( callback ) {
      return function() {
         var returnValueFromCallback = callback.apply(this, arguments);

         if( defined(returnValueFromCallback) ) {

            if( returnValueFromCallback == oboe.drop ) {
               emitNodeDrop();
            } else {
               emitNodeSwap(returnValueFromCallback);
            }
         }
      }
   }

   function addSingleNodeOrPathListener(eventId, pattern, callback) {

      var effectiveCallback;

      if( eventId == 'node' ) {
         effectiveCallback = wrapCallbackToSwapNodeIfSomethingReturned(callback);
      } else {
         effectiveCallback = callback;
      }

      addForgettableCallback(
         fullyQualifiedPatternMatchEvent(eventId, pattern),
         effectiveCallback,
         callback
      );
   }

   /**
    * Add several listeners at a time, from a map
    */
   function addMultipleNodeOrPathListeners(eventId, listenerMap) {

      for( var pattern in listenerMap ) {
         addSingleNodeOrPathListener(eventId, pattern, listenerMap[pattern]);
      }
   }

   /**
    * implementation behind .onPath() and .onNode()
    */
   function addNodeOrPathListenerApi( eventId, jsonPathOrListenerMap, callback ){

      if( isString(jsonPathOrListenerMap) ) {
         addSingleNodeOrPathListener(eventId, jsonPathOrListenerMap, callback);

      } else {
         addMultipleNodeOrPathListeners(eventId, jsonPathOrListenerMap);
      }

      return oboeApi; // chaining
   }


   // some interface methods are only filled in after we receive
   // values and are noops before that:
   oboeBus(ROOT_PATH_FOUND).on( function(rootNode) {
      oboeApi.root = functor(rootNode);
   });

   /**
    * When content starts make the headers readable through the
    * instance API
    */
   oboeBus(HTTP_START).on( function(_statusCode, headers) {

      oboeApi.header =  function(name) {
                           return name ? headers[name]
                                       : headers
                                       ;
                        }
   });

   /**
    * Construct and return the public API of the Oboe instance to be
    * returned to the calling application
    */
   return oboeApi = {
      on             : addListener,
      addListener    : addListener,
      removeListener : removeListener,
      emit           : oboeBus.emit,

      node           : partialComplete(addNodeOrPathListenerApi, 'node'),
      path           : partialComplete(addNodeOrPathListenerApi, 'path'),

      done           : partialComplete(addForgettableCallback, rootNodeFinishedEvent),
      start          : partialComplete(addProtectedCallback, HTTP_START ),

      // fail doesn't use protectedCallback because
      // could lead to non-terminating loops
      fail           : oboeBus(FAIL_EVENT).on,

      // public api calling abort fires the ABORTING event
      abort          : oboeBus(ABORTING).emit,

      // initially return nothing for header and root
      header         : noop,
      root           : noop,

      source         : contentSource
   };
}

/**
 * This file sits just behind the API which is used to attain a new
 * Oboe instance. It creates the new components that are required
 * and introduces them to each other.
 */

function wire (httpMethodName, contentSource, body, headers, withCredentials){

   var oboeBus = pubSub();
   
   // Wire the input stream in if we are given a content source.
   // This will usually be the case. If not, the instance created
   // will have to be passed content from an external source.
  
   if( contentSource ) {

      streamingHttp( oboeBus,
                     httpTransport(), 
                     httpMethodName,
                     contentSource,
                     body,
                     headers,
                     withCredentials
      );
   }

   clarinet(oboeBus);

   ascentManager(oboeBus, incrementalContentBuilder(oboeBus));
      
   patternAdapter(oboeBus, jsonPathCompiler);      
      
   return instanceApi(oboeBus, contentSource);
}

function applyDefaults( passthrough, url, httpMethodName, body, headers, withCredentials, cached ){

   headers = headers ?
      // Shallow-clone the headers array. This allows it to be
      // modified without side effects to the caller. We don't
      // want to change objects that the user passes in.
      JSON.parse(JSON.stringify(headers))
      : {};

   if( body ) {
      if( !isString(body) ) {

         // If the body is not a string, stringify it. This allows objects to
         // be given which will be sent as JSON.
         body = JSON.stringify(body);

         // Default Content-Type to JSON unless given otherwise.
         headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      }
   } else {
      body = null;
   }

   // support cache busting like jQuery.ajax({cache:false})
   function modifiedurl(baseUrl, cached) {

      if( cached === false ) {

         if( baseUrl.indexOf('?') == -1 ) {
            baseUrl += '?';
         } else {
            baseUrl += '&';
         }

         baseUrl += '_=' + new Date().getTime();
      }
      return baseUrl;
   }

   return passthrough( httpMethodName || 'GET', modifiedurl(url, cached), body, headers, withCredentials || false );
}

// export public API
function oboe(arg1) {

   // We use duck-typing to detect if the parameter given is a stream, with the
   // below list of parameters.
   // Unpipe and unshift would normally be present on a stream but this breaks
   // compatibility with Request streams.
   // See https://github.com/jimhigson/oboe.js/issues/65
   
   var nodeStreamMethodNames = list('resume', 'pause', 'pipe'),
       isStream = partialComplete(
                     hasAllProperties
                  ,  nodeStreamMethodNames
                  );
   
   if( arg1 ) {
      if (isStream(arg1) || isString(arg1)) {

         //  simple version for GETs. Signature is:
         //    oboe( url )
         //  or, under node:
         //    oboe( readableStream )
         return applyDefaults(
            wire,
            arg1 // url
         );

      } else {

         // method signature is:
         //    oboe({method:m, url:u, body:b, headers:{...}})

         return applyDefaults(
            wire,
            arg1.url,
            arg1.method,
            arg1.body,
            arg1.headers,
            arg1.withCredentials,
            arg1.cached
         );
         
      }
   } else {
      // wire up a no-AJAX, no-stream Oboe. Will have to have content 
      // fed in externally and using .emit.
      return wire();
   }
}

/* oboe.drop is a special value. If a node callback returns this value the
   parsed node is deleted from the JSON
 */
oboe.drop = function() {
   return oboe.drop;
};


   if ( typeof define === "function" && define.amd ) {
      define( "oboe", [], function () { return oboe; } );
   } else if (typeof exports === 'object') {
      module.exports = oboe;
   } else {
      window.oboe = oboe;
   }
})((function(){
   // Access to the window object throws an exception in HTML5 web workers so
   // point it to "self" if it runs in a web worker
      try {
         return window;
      } catch (e) {
         return self;
      }
   }()), Object, Array, Error, JSON);

},{}],310:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"dup":110}],311:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"./certificate":312,"asn1.js":181,"dup":111}],312:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"asn1.js":181,"dup":112}],313:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"browserify-aes":199,"buffer":48,"dup":113,"evp_bytestokey":279}],314:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"./aesid.json":310,"./asn1":311,"./fixProc":313,"browserify-aes":199,"buffer":48,"dup":114,"pbkdf2":316}],315:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":280,"trim":351}],316:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"./lib/async":317,"./lib/sync":320,"dup":115}],317:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"./default-encoding":318,"./precondition":319,"./sync":320,"_process":121,"dup":116,"safe-buffer":334}],318:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"_process":121,"dup":117}],319:[function(require,module,exports){
(function (Buffer){
var MAX_ALLOC = Math.pow(2, 30) - 1 // default in iojs

function checkBuffer (buf, name) {
  if (typeof buf !== 'string' && !Buffer.isBuffer(buf)) {
    throw new TypeError(name + ' must be a buffer or string')
  }
}

module.exports = function (password, salt, iterations, keylen) {
  checkBuffer(password, 'Password')
  checkBuffer(salt, 'Salt')

  if (typeof iterations !== 'number') {
    throw new TypeError('Iterations not a number')
  }

  if (iterations < 0) {
    throw new TypeError('Bad iterations')
  }

  if (typeof keylen !== 'number') {
    throw new TypeError('Key length not a number')
  }

  if (keylen < 0 || keylen > MAX_ALLOC || keylen !== keylen) { /* eslint no-self-compare: 0 */
    throw new TypeError('Bad key length')
  }
}

}).call(this,{"isBuffer":require("../../../../.npm-global/lib/node_modules/browserify/node_modules/is-buffer/index.js")})
},{"../../../../.npm-global/lib/node_modules/browserify/node_modules/is-buffer/index.js":103}],320:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"./default-encoding":318,"./precondition":319,"create-hash/md5":229,"dup":119,"ripemd160":333,"safe-buffer":334,"sha.js":338}],321:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"./privateDecrypt":323,"./publicEncrypt":324,"dup":122}],322:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"create-hash":228,"dup":123,"safe-buffer":334}],323:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"./mgf":322,"./withPublic":325,"./xor":326,"bn.js":195,"browserify-rsa":217,"create-hash":228,"dup":124,"parse-asn1":314,"safe-buffer":334}],324:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"./mgf":322,"./withPublic":325,"./xor":326,"bn.js":195,"browserify-rsa":217,"create-hash":228,"dup":125,"parse-asn1":314,"randombytes":328,"safe-buffer":334}],325:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"bn.js":195,"dup":126,"safe-buffer":334}],326:[function(require,module,exports){
arguments[4][127][0].apply(exports,arguments)
},{"dup":127}],327:[function(require,module,exports){
'use strict';
var strictUriEncode = require('strict-uri-encode');
var objectAssign = require('object-assign');
var decodeComponent = require('decode-uri-component');

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

function extract(str) {
	var queryStart = str.indexOf('?');
	if (queryStart === -1) {
		return '';
	}
	return str.slice(queryStart + 1);
}

function parse(str, opts) {
	opts = objectAssign({arrayFormat: 'none'}, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^[?#&]/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeComponent(val);

		formatter(decodeComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
}

exports.extract = extract;
exports.parse = parse;

exports.stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	if (opts.sort === false) {
		opts.sort = function () {};
	}

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort(opts.sort).map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

exports.parseUrl = function (str, opts) {
	return {
		url: str.split('?')[0] || '',
		query: parse(extract(str), opts)
	};
};

},{"decode-uri-component":233,"object-assign":308,"strict-uri-encode":345}],328:[function(require,module,exports){
arguments[4][132][0].apply(exports,arguments)
},{"_process":121,"dup":132,"safe-buffer":334}],329:[function(require,module,exports){
arguments[4][133][0].apply(exports,arguments)
},{"_process":121,"dup":133,"randombytes":328,"safe-buffer":334}],330:[function(require,module,exports){
module.exports = window.crypto;
},{}],331:[function(require,module,exports){
module.exports = require('crypto');
},{"crypto":330}],332:[function(require,module,exports){
var randomHex = function(size, callback) {
    var crypto = require('./crypto.js');
    var isCallback = (typeof callback === 'function');

    
    if (size > 65536) {
        if(isCallback) {
            callback(new Error('Requested too many random bytes.'));
        } else {
            throw new Error('Requested too many random bytes.');
        }
    };


    // is node
    if (typeof crypto !== 'undefined' && crypto.randomBytes) {

        if(isCallback) {
            crypto.randomBytes(size, function(err, result){
                if(!err) {
                    callback(null, '0x'+ result.toString('hex'));
                } else {
                    callback(error);
                }
            })
        } else {
            return '0x'+ crypto.randomBytes(size).toString('hex');
        }

    // is browser
    } else {
        var cryptoLib;

        if (typeof crypto !== 'undefined') {
            cryptoLib = crypto;
        } else if(typeof msCrypto !== 'undefined') {
            cryptoLib = msCrypto;
        }

        if (cryptoLib && cryptoLib.getRandomValues) {
            var randomBytes = cryptoLib.getRandomValues(new Uint8Array(size));
            var returnValue = '0x'+ Array.from(randomBytes).map(function(arr){ return arr.toString(16); }).join('');

            if(isCallback) {
                callback(null, returnValue);
            } else {
                return returnValue;
            }

        // not crypto object
        } else {
            var error = new Error('No "crypto" object available. This Browser doesn\'t support generating secure random bytes.');

            if(isCallback) {
                callback(error);
            } else {
               throw error;
            }
        }
    }
};


module.exports = randomHex;

},{"./crypto.js":331}],333:[function(require,module,exports){
arguments[4][147][0].apply(exports,arguments)
},{"buffer":48,"dup":147,"hash-base":282,"inherits":298}],334:[function(require,module,exports){
arguments[4][148][0].apply(exports,arguments)
},{"buffer":48,"dup":148}],335:[function(require,module,exports){
module.exports = require('scryptsy')

},{"scryptsy":336}],336:[function(require,module,exports){
(function (Buffer){
var pbkdf2Sync = require('pbkdf2').pbkdf2Sync

var MAX_VALUE = 0x7fffffff

// N = Cpu cost, r = Memory cost, p = parallelization cost
function scrypt (key, salt, N, r, p, dkLen, progressCallback) {
  if (N === 0 || (N & (N - 1)) !== 0) throw Error('N must be > 0 and a power of 2')

  if (N > MAX_VALUE / 128 / r) throw Error('Parameter N is too large')
  if (r > MAX_VALUE / 128 / p) throw Error('Parameter r is too large')

  var XY = new Buffer(256 * r)
  var V = new Buffer(128 * r * N)

  // pseudo global
  var B32 = new Int32Array(16) // salsa20_8
  var x = new Int32Array(16) // salsa20_8
  var _X = new Buffer(64) // blockmix_salsa8

  // pseudo global
  var B = pbkdf2Sync(key, salt, 1, p * 128 * r, 'sha256')

  var tickCallback
  if (progressCallback) {
    var totalOps = p * N * 2
    var currentOp = 0

    tickCallback = function () {
      ++currentOp

      // send progress notifications once every 1,000 ops
      if (currentOp % 1000 === 0) {
        progressCallback({
          current: currentOp,
          total: totalOps,
          percent: (currentOp / totalOps) * 100.0
        })
      }
    }
  }

  for (var i = 0; i < p; i++) {
    smix(B, i * 128 * r, r, N, V, XY)
  }

  return pbkdf2Sync(key, B, 1, dkLen, 'sha256')

  // all of these functions are actually moved to the top
  // due to function hoisting

  function smix (B, Bi, r, N, V, XY) {
    var Xi = 0
    var Yi = 128 * r
    var i

    B.copy(XY, Xi, Bi, Bi + Yi)

    for (i = 0; i < N; i++) {
      XY.copy(V, i * Yi, Xi, Xi + Yi)
      blockmix_salsa8(XY, Xi, Yi, r)

      if (tickCallback) tickCallback()
    }

    for (i = 0; i < N; i++) {
      var offset = Xi + (2 * r - 1) * 64
      var j = XY.readUInt32LE(offset) & (N - 1)
      blockxor(V, j * Yi, XY, Xi, Yi)
      blockmix_salsa8(XY, Xi, Yi, r)

      if (tickCallback) tickCallback()
    }

    XY.copy(B, Bi, Xi, Xi + Yi)
  }

  function blockmix_salsa8 (BY, Bi, Yi, r) {
    var i

    arraycopy(BY, Bi + (2 * r - 1) * 64, _X, 0, 64)

    for (i = 0; i < 2 * r; i++) {
      blockxor(BY, i * 64, _X, 0, 64)
      salsa20_8(_X)
      arraycopy(_X, 0, BY, Yi + (i * 64), 64)
    }

    for (i = 0; i < r; i++) {
      arraycopy(BY, Yi + (i * 2) * 64, BY, Bi + (i * 64), 64)
    }

    for (i = 0; i < r; i++) {
      arraycopy(BY, Yi + (i * 2 + 1) * 64, BY, Bi + (i + r) * 64, 64)
    }
  }

  function R (a, b) {
    return (a << b) | (a >>> (32 - b))
  }

  function salsa20_8 (B) {
    var i

    for (i = 0; i < 16; i++) {
      B32[i] = (B[i * 4 + 0] & 0xff) << 0
      B32[i] |= (B[i * 4 + 1] & 0xff) << 8
      B32[i] |= (B[i * 4 + 2] & 0xff) << 16
      B32[i] |= (B[i * 4 + 3] & 0xff) << 24
      // B32[i] = B.readUInt32LE(i*4)   <--- this is signficantly slower even in Node.js
    }

    arraycopy(B32, 0, x, 0, 16)

    for (i = 8; i > 0; i -= 2) {
      x[ 4] ^= R(x[ 0] + x[12], 7)
      x[ 8] ^= R(x[ 4] + x[ 0], 9)
      x[12] ^= R(x[ 8] + x[ 4], 13)
      x[ 0] ^= R(x[12] + x[ 8], 18)
      x[ 9] ^= R(x[ 5] + x[ 1], 7)
      x[13] ^= R(x[ 9] + x[ 5], 9)
      x[ 1] ^= R(x[13] + x[ 9], 13)
      x[ 5] ^= R(x[ 1] + x[13], 18)
      x[14] ^= R(x[10] + x[ 6], 7)
      x[ 2] ^= R(x[14] + x[10], 9)
      x[ 6] ^= R(x[ 2] + x[14], 13)
      x[10] ^= R(x[ 6] + x[ 2], 18)
      x[ 3] ^= R(x[15] + x[11], 7)
      x[ 7] ^= R(x[ 3] + x[15], 9)
      x[11] ^= R(x[ 7] + x[ 3], 13)
      x[15] ^= R(x[11] + x[ 7], 18)
      x[ 1] ^= R(x[ 0] + x[ 3], 7)
      x[ 2] ^= R(x[ 1] + x[ 0], 9)
      x[ 3] ^= R(x[ 2] + x[ 1], 13)
      x[ 0] ^= R(x[ 3] + x[ 2], 18)
      x[ 6] ^= R(x[ 5] + x[ 4], 7)
      x[ 7] ^= R(x[ 6] + x[ 5], 9)
      x[ 4] ^= R(x[ 7] + x[ 6], 13)
      x[ 5] ^= R(x[ 4] + x[ 7], 18)
      x[11] ^= R(x[10] + x[ 9], 7)
      x[ 8] ^= R(x[11] + x[10], 9)
      x[ 9] ^= R(x[ 8] + x[11], 13)
      x[10] ^= R(x[ 9] + x[ 8], 18)
      x[12] ^= R(x[15] + x[14], 7)
      x[13] ^= R(x[12] + x[15], 9)
      x[14] ^= R(x[13] + x[12], 13)
      x[15] ^= R(x[14] + x[13], 18)
    }

    for (i = 0; i < 16; ++i) B32[i] = x[i] + B32[i]

    for (i = 0; i < 16; i++) {
      var bi = i * 4
      B[bi + 0] = (B32[i] >> 0 & 0xff)
      B[bi + 1] = (B32[i] >> 8 & 0xff)
      B[bi + 2] = (B32[i] >> 16 & 0xff)
      B[bi + 3] = (B32[i] >> 24 & 0xff)
      // B.writeInt32LE(B32[i], i*4)  //<--- this is signficantly slower even in Node.js
    }
  }

  // naive approach... going back to loop unrolling may yield additional performance
  function blockxor (S, Si, D, Di, len) {
    for (var i = 0; i < len; i++) {
      D[Di + i] ^= S[Si + i]
    }
  }
}

function arraycopy (src, srcPos, dest, destPos, length) {
  if (Buffer.isBuffer(src) && Buffer.isBuffer(dest)) {
    src.copy(dest, destPos, srcPos, srcPos + length)
  } else {
    while (length--) {
      dest[destPos++] = src[srcPos++]
    }
  }
}

module.exports = scrypt

}).call(this,require("buffer").Buffer)
},{"buffer":48,"pbkdf2":316}],337:[function(require,module,exports){
arguments[4][149][0].apply(exports,arguments)
},{"dup":149,"safe-buffer":334}],338:[function(require,module,exports){
arguments[4][150][0].apply(exports,arguments)
},{"./sha":339,"./sha1":340,"./sha224":341,"./sha256":342,"./sha384":343,"./sha512":344,"dup":150}],339:[function(require,module,exports){
arguments[4][151][0].apply(exports,arguments)
},{"./hash":337,"dup":151,"inherits":298,"safe-buffer":334}],340:[function(require,module,exports){
arguments[4][152][0].apply(exports,arguments)
},{"./hash":337,"dup":152,"inherits":298,"safe-buffer":334}],341:[function(require,module,exports){
arguments[4][153][0].apply(exports,arguments)
},{"./hash":337,"./sha256":342,"dup":153,"inherits":298,"safe-buffer":334}],342:[function(require,module,exports){
arguments[4][154][0].apply(exports,arguments)
},{"./hash":337,"dup":154,"inherits":298,"safe-buffer":334}],343:[function(require,module,exports){
arguments[4][155][0].apply(exports,arguments)
},{"./hash":337,"./sha512":344,"dup":155,"inherits":298,"safe-buffer":334}],344:[function(require,module,exports){
arguments[4][156][0].apply(exports,arguments)
},{"./hash":337,"dup":156,"inherits":298,"safe-buffer":334}],345:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};

},{}],346:[function(require,module,exports){
var isHexPrefixed = require('is-hex-prefixed');

/**
 * Removes '0x' from a given `String` is present
 * @param {String} str the string value
 * @return {String|Optional} a string by pass if necessary
 */
module.exports = function stripHexPrefix(str) {
  if (typeof str !== 'string') {
    return str;
  }

  return isHexPrefixed(str) ? str.slice(2) : str;
}

},{"is-hex-prefixed":301}],347:[function(require,module,exports){
var unavailable = function unavailable() {
  throw "This swarm.js function isn't available on the browser.";
};

var fsp = { readFile: unavailable };
var files = { download: unavailable, safeDownloadArchived: unavailable, directoryTree: unavailable };
var os = { platform: unavailable, arch: unavailable };
var path = { join: unavailable, slice: unavailable };
var child_process = { spawn: unavailable };
var mimetype = { lookup: unavailable };
var defaultArchives = {};
var downloadUrl = null;
var request = require("xhr-request-promise");
var bytes = require("eth-lib/lib/bytes");
var hash = require("./swarm-hash.js");
var pick = require("./pick.js");
var swarm = require("./swarm");

module.exports = swarm({
  fsp: fsp,
  files: files,
  os: os,
  path: path,
  child_process: child_process,
  defaultArchives: defaultArchives,
  mimetype: mimetype,
  request: request,
  downloadUrl: downloadUrl,
  bytes: bytes,
  hash: hash,
  pick: pick
});
},{"./pick.js":348,"./swarm":350,"./swarm-hash.js":349,"eth-lib/lib/bytes":263,"xhr-request-promise":406}],348:[function(require,module,exports){
var picker = function picker(type) {
  return function () {
    return new Promise(function (resolve, reject) {
      var fileLoader = function fileLoader(e) {
        var directory = {};
        var totalFiles = e.target.files.length;
        var loadedFiles = 0;
        [].map.call(e.target.files, function (file) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            if (type === "directory") {
              var path = file.webkitRelativePath;
              directory[path.slice(path.indexOf("/") + 1)] = {
                type: "text/plain",
                data: data
              };
              if (++loadedFiles === totalFiles) resolve(directory);
            } else if (type === "file") {
              var _path = file.webkitRelativePath;
              resolve({ "type": mimetype.lookup(_path), "data": data });
            } else {
              resolve(data);
            }
          };
          reader.readAsArrayBuffer(file);
        });
      };

      var fileInput = void 0;
      if (type === "directory") {
        fileInput = document.createElement("input");
        fileInput.addEventListener("change", fileLoader);
        fileInput.type = "file";
        fileInput.webkitdirectory = true;
        fileInput.mozdirectory = true;
        fileInput.msdirectory = true;
        fileInput.odirectory = true;
        fileInput.directory = true;
      } else {
        fileInput = document.createElement("input");
        fileInput.addEventListener("change", fileLoader);
        fileInput.type = "file";
      };

      var mouseEvent = document.createEvent("MouseEvents");
      mouseEvent.initEvent("click", true, false);
      fileInput.dispatchEvent(mouseEvent);
    });
  };
};

module.exports = {
  data: picker("data"),
  file: picker("file"),
  directory: picker("directory")
};
},{}],349:[function(require,module,exports){
// Thanks https://github.com/axic/swarmhash

var keccak = require("eth-lib/lib/hash").keccak256;
var Bytes = require("eth-lib/lib/bytes");

var swarmHashBlock = function swarmHashBlock(length, data) {
  var lengthEncoded = Bytes.reverse(Bytes.pad(6, Bytes.fromNumber(length)));
  var bytes = Bytes.flatten([lengthEncoded, "0x0000", data]);
  return keccak(bytes).slice(2);
};

// (Bytes | Uint8Array | String) -> String
var swarmHash = function swarmHash(data) {
  if (typeof data === "string" && data.slice(0, 2) !== "0x") {
    data = Bytes.fromString(data);
  } else if (typeof data !== "string" && data.length !== undefined) {
    data = Bytes.fromUint8Array(data);
  }

  var length = Bytes.length(data);

  if (length <= 4096) {
    return swarmHashBlock(length, data);
  }

  var maxSize = 4096;
  while (maxSize * (4096 / 32) < length) {
    maxSize *= 4096 / 32;
  }

  var innerNodes = [];
  for (var i = 0; i < length; i += maxSize) {
    var size = maxSize < length - i ? maxSize : length - i;
    innerNodes.push(swarmHash(Bytes.slice(data, i, i + size)));
  }

  return swarmHashBlock(length, Bytes.flatten(innerNodes));
};

module.exports = swarmHash;
},{"eth-lib/lib/bytes":263,"eth-lib/lib/hash":264}],350:[function(require,module,exports){
// TODO: this is a temporary fix to hide those libraries from the browser. A
// slightly better long-term solution would be to split this file into two,
// separating the functions that are used on Node.js from the functions that
// are used only on the browser.
module.exports = function (_ref) {
  var fsp = _ref.fsp,
      files = _ref.files,
      os = _ref.os,
      path = _ref.path,
      child_process = _ref.child_process,
      mimetype = _ref.mimetype,
      defaultArchives = _ref.defaultArchives,
      request = _ref.request,
      downloadUrl = _ref.downloadUrl,
      bytes = _ref.bytes,
      hash = _ref.hash,
      pick = _ref.pick;


  // ∀ a . String -> JSON -> Map String a -o Map String a
  //   Inserts a key/val pair in an object impurely.
  var impureInsert = function impureInsert(key) {
    return function (val) {
      return function (map) {
        return map[key] = val, map;
      };
    };
  };

  // String -> JSON -> Map String JSON
  //   Merges an array of keys and an array of vals into an object.
  var toMap = function toMap(keys) {
    return function (vals) {
      var map = {};
      for (var i = 0, l = keys.length; i < l; ++i) {
        map[keys[i]] = vals[i];
      }return map;
    };
  };

  // ∀ a . Map String a -> Map String a -> Map String a
  //   Merges two maps into one.
  var merge = function merge(a) {
    return function (b) {
      var map = {};
      for (var key in a) {
        map[key] = a[key];
      }for (var _key in b) {
        map[_key] = b[_key];
      }return map;
    };
  };

  // ∀ a . [a] -> [a] -> Bool
  var equals = function equals(a) {
    return function (b) {
      if (a.length !== b.length) {
        return false;
      } else {
        for (var i = 0, l = a.length; i < a; ++i) {
          if (a[i] !== b[i]) return false;
        }
      }
      return true;
    };
  };

  // String -> String -> String
  var rawUrl = function rawurl(swarmUrl) {
    return function (hash) {
      return swarmUrl + "/bzzr:/" + hash;
    };
  };

  // String -> String -> Promise Uint8Array
  //   Gets the raw contents of a Swarm hash address.
  var downloadData = function downloadData(swarmUrl) {
    return function (hash) {
      return request(rawurl(swarmUrl)(hash), { responseType: "arraybuffer" }).then(function (arrayBuffer) {
        var uint8Array = new Uint8Array(arrayBuffer);
        var error404 = [52, 48, 52, 32, 112, 97, 103, 101, 32, 110, 111, 116, 32, 102, 111, 117, 110, 100, 10];
        if (equals(uint8Array)(error404)) throw "Error 404.";
        return uint8Array;
      });
    };
  };

  // type Entry = {"type": String, "hash": String}
  // type File = {"type": String, "data": Uint8Array}

  // String -> String -> Promise (Map String Entry)
  //   Solves the manifest of a Swarm address recursively.
  //   Returns a map from full paths to entries.
  var downloadEntries = function downloadEntries(swarmUrl) {
    return function (hash) {
      var search = function search(hash) {
        return function (path) {
          return function (routes) {
            // Formats an entry to the Swarm.js type.
            var format = function format(entry) {
              return {
                type: entry.contentType,
                hash: entry.hash };
            };

            // To download a single entry:
            //   if type is bzz-manifest, go deeper
            //   if not, add it to the routing table
            var downloadEntry = function downloadEntry(entry) {
              if (entry.path === undefined) {
                return Promise.resolve();
              } else {
                return entry.contentType === "application/bzz-manifest+json" ? search(entry.hash)(path + entry.path)(routes) : Promise.resolve(impureInsert(path + entry.path)(format(entry))(routes));
              }
            };

            // Downloads the initial manifest and then each entry.
            return downloadData(swarmUrl)(hash).then(function (text) {
              return JSON.parse(toString(text)).entries;
            }).then(function (entries) {
              return Promise.all(entries.map(downloadEntry));
            }).then(function () {
              return routes;
            });
          };
        };
      };

      return search(hash)("")({});
    };
  };

  // String -> String -> Promise (Map String String)
  //   Same as `downloadEntries`, but returns only hashes (no types).
  var downloadRoutes = function downloadRoutes(swarmUrl) {
    return function (hash) {
      return downloadEntries(swarmUrl)(hash).then(function (entries) {
        return toMap(Object.keys(entries))(Object.keys(entries).map(function (route) {
          return entries[route].hash;
        }));
      });
    };
  };

  // String -> String -> Promise (Map String File)
  //   Gets the entire directory tree in a Swarm address.
  //   Returns a promise mapping paths to file contents.
  var downloadDirectory = function downloadDirectory(swarmUrl) {
    return function (hash) {
      return downloadEntries(swarmUrl)(hash).then(function (entries) {
        var paths = Object.keys(entries);
        var hashs = paths.map(function (path) {
          return entries[path].hash;
        });
        var types = paths.map(function (path) {
          return entries[path].type;
        });
        var datas = hashs.map(downloadData(swarmUrl));
        var files = function files(datas) {
          return datas.map(function (data, i) {
            return { type: types[i], data: data };
          });
        };
        return Promise.all(datas).then(function (datas) {
          return toMap(paths)(files(datas));
        });
      });
    };
  };

  // String -> String -> String -> Promise String
  //   Gets the raw contents of a Swarm hash address.
  //   Returns a promise with the downloaded file path.
  var downloadDataToDisk = function downloadDataToDisk(swarmUrl) {
    return function (hash) {
      return function (filePath) {
        return files.download(rawurl(swarmUrl)(hash))(filePath);
      };
    };
  };

  // String -> String -> String -> Promise (Map String String)
  //   Gets the entire directory tree in a Swarm address.
  //   Returns a promise mapping paths to file contents.
  var downloadDirectoryToDisk = function downloadDirectoryToDisk(swarmUrl) {
    return function (hash) {
      return function (dirPath) {
        return downloadRoutes(swarmUrl)(hash).then(function (routingTable) {
          var downloads = [];
          for (var route in routingTable) {
            if (route.length > 0) {
              var filePath = path.join(dirPath, route);
              downloads.push(downloadDataToDisk(swarmUrl)(routingTable[route])(filePath));
            };
          };
          return Promise.all(downloads).then(function () {
            return dirPath;
          });
        });
      };
    };
  };

  // String -> Uint8Array -> Promise String
  //   Uploads raw data to Swarm.
  //   Returns a promise with the uploaded hash.
  var uploadData = function uploadData(swarmUrl) {
    return function (data) {
      return request(swarmUrl + "/bzzr:/", {
        body: typeof data === "string" ? fromString(data) : data,
        method: "POST" });
    };
  };

  // String -> String -> String -> File -> Promise String
  //   Uploads a file to the Swarm manifest at a given hash, under a specific
  //   route. Returns a promise containing the uploaded hash.
  //   FIXME: for some reasons Swarm-Gateways is sometimes returning
  //   error 404 (bad request), so we retry up to 3 times. Why?
  var uploadToManifest = function uploadToManifest(swarmUrl) {
    return function (hash) {
      return function (route) {
        return function (file) {
          var attempt = function attempt(n) {
            var slashRoute = route[0] === "/" ? route : "/" + route;
            var url = swarmUrl + "/bzz:/" + hash + slashRoute;
            var opt = {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file.data };
            return request(url, opt).then(function (response) {
              if (response.indexOf("error") !== -1) {
                throw response;
              }
              return response;
            }).catch(function (e) {
              return n > 0 && attempt(n - 1);
            });
          };
          return attempt(3);
        };
      };
    };
  };

  // String -> {type: String, data: Uint8Array} -> Promise String
  var uploadFile = function uploadFile(swarmUrl) {
    return function (file) {
      return uploadDirectory(swarmUrl)({ "": file });
    };
  };

  // String -> String -> Promise String
  var uploadFileFromDisk = function uploadFileFromDisk(swarmUrl) {
    return function (filePath) {
      return fsp.readFile(filePath).then(function (data) {
        return uploadFile(swarmUrl)({ type: mimetype.lookup(filePath), data: data });
      });
    };
  };

  // String -> Map String File -> Promise String
  //   Uploads a directory to Swarm. The directory is
  //   represented as a map of routes and files.
  //   A default path is encoded by having a "" route.
  var uploadDirectory = function uploadDirectory(swarmUrl) {
    return function (directory) {
      return uploadData(swarmUrl)("{}").then(function (hash) {
        var uploadRoute = function uploadRoute(route) {
          return function (hash) {
            return uploadToManifest(swarmUrl)(hash)(route)(directory[route]);
          };
        };
        var uploadToHash = function uploadToHash(hash, route) {
          return hash.then(uploadRoute(route));
        };
        return Object.keys(directory).reduce(uploadToHash, Promise.resolve(hash));
      });
    };
  };

  // String -> Promise String
  var uploadDataFromDisk = function uploadDataFromDisk(swarmUrl) {
    return function (filePath) {
      return fsp.readFile(filePath).then(uploadData(swarmUrl));
    };
  };

  // String -> Nullable String -> String -> Promise String
  var uploadDirectoryFromDisk = function uploadDirectoryFromDisk(swarmUrl) {
    return function (defaultPath) {
      return function (dirPath) {
        return files.directoryTree(dirPath).then(function (fullPaths) {
          return Promise.all(fullPaths.map(function (path) {
            return fsp.readFile(path);
          })).then(function (datas) {
            var paths = fullPaths.map(function (path) {
              return path.slice(dirPath.length);
            });
            var types = fullPaths.map(function (path) {
              return mimetype.lookup(path) || "text/plain";
            });
            return toMap(paths)(datas.map(function (data, i) {
              return { type: types[i], data: data };
            }));
          });
        }).then(function (directory) {
          return merge(defaultPath ? { "": directory[defaultPath] } : {})(directory);
        }).then(uploadDirectory(swarmUrl));
      };
    };
  };

  // String -> UploadInfo -> Promise String
  //   Simplified multi-type upload which calls the correct
  //   one based on the type of the argument given.
  var _upload = function _upload(swarmUrl) {
    return function (arg) {
      // Upload raw data from browser
      if (arg.pick === "data") {
        return pick.data().then(uploadData(swarmUrl));

        // Upload a file from browser
      } else if (arg.pick === "file") {
        return pick.file().then(uploadFile(swarmUrl));

        // Upload a directory from browser
      } else if (arg.pick === "directory") {
        return pick.directory().then(uploadDirectory(swarmUrl));

        // Upload directory/file from disk
      } else if (arg.path) {
        switch (arg.kind) {
          case "data":
            return uploadDataFromDisk(swarmUrl)(arg.path);
          case "file":
            return uploadFileFromDisk(swarmUrl)(arg.path);
          case "directory":
            return uploadDirectoryFromDisk(swarmUrl)(arg.defaultFile)(arg.path);
        };

        // Upload UTF-8 string or raw data (buffer)
      } else if (arg.length || typeof arg === "string") {
        return uploadData(swarmUrl)(arg);

        // Upload directory with JSON
      } else if (arg instanceof Object) {
        return uploadDirectory(swarmUrl)(arg);
      }

      return Promise.reject(new Error("Bad arguments"));
    };
  };

  // String -> String -> Nullable String -> Promise (String | Uint8Array | Map String Uint8Array)
  //   Simplified multi-type download which calls the correct function based on
  //   the type of the argument given, and on whether the Swwarm address has a
  //   directory or a file.
  var _download = function _download(swarmUrl) {
    return function (hash) {
      return function (path) {
        return isDirectory(swarmUrl)(hash).then(function (isDir) {
          if (isDir) {
            return path ? downloadDirectoryToDisk(swarmUrl)(hash)(path) : downloadDirectory(swarmUrl)(hash);
          } else {
            return path ? downloadDataToDisk(swarmUrl)(hash)(path) : downloadData(swarmUrl)(hash);
          }
        });
      };
    };
  };

  // String -> Promise String
  //   Downloads the Swarm binaries into a path. Returns a promise that only
  //   resolves when the exact Swarm file is there, and verified to be correct.
  //   If it was already there to begin with, skips the download.
  var downloadBinary = function downloadBinary(path, archives) {
    var system = os.platform().replace("win32", "windows") + "-" + (os.arch() === "x64" ? "amd64" : "386");
    var archive = (archives || defaultArchives)[system];
    var archiveUrl = downloadUrl + archive.archive + ".tar.gz";
    var archiveMD5 = archive.archiveMD5;
    var binaryMD5 = archive.binaryMD5;
    return files.safeDownloadArchived(archiveUrl)(archiveMD5)(binaryMD5)(path);
  };

  // type SwarmSetup = {
  //   account : String,
  //   password : String,
  //   dataDir : String,
  //   binPath : String,
  //   ensApi : String,
  //   onDownloadProgress : Number ~> (),
  //   archives : [{
  //     archive: String,
  //     binaryMD5: String,
  //     archiveMD5: String
  //   }]
  // }

  // SwarmSetup ~> Promise Process
  //   Starts the Swarm process.
  var startProcess = function startProcess(swarmSetup) {
    return new Promise(function (resolve, reject) {
      var spawn = child_process.spawn;


      var hasString = function hasString(str) {
        return function (buffer) {
          return ('' + buffer).indexOf(str) !== -1;
        };
      };
      var account = swarmSetup.account,
          password = swarmSetup.password,
          dataDir = swarmSetup.dataDir,
          ensApi = swarmSetup.ensApi,
          privateKey = swarmSetup.privateKey;


      var STARTUP_TIMEOUT_SECS = 3;
      var WAITING_PASSWORD = 0;
      var STARTING = 1;
      var LISTENING = 2;
      var PASSWORD_PROMPT_HOOK = "Passphrase";
      var LISTENING_HOOK = "Swarm http proxy started";

      var state = WAITING_PASSWORD;

      var swarmProcess = spawn(swarmSetup.binPath, ['--bzzaccount', account || privateKey, '--datadir', dataDir, '--ens-api', ensApi]);

      var handleProcessOutput = function handleProcessOutput(data) {
        if (state === WAITING_PASSWORD && hasString(PASSWORD_PROMPT_HOOK)(data)) {
          setTimeout(function () {
            state = STARTING;
            swarmProcess.stdin.write(password + '\n');
          }, 500);
        } else if (hasString(LISTENING_HOOK)(data)) {
          state = LISTENING;
          clearTimeout(timeout);
          resolve(swarmProcess);
        }
      };

      swarmProcess.stdout.on('data', handleProcessOutput);
      swarmProcess.stderr.on('data', handleProcessOutput);
      //swarmProcess.on('close', () => setTimeout(restart, 2000));

      var restart = function restart() {
        return startProcess(swarmSetup).then(resolve).catch(reject);
      };
      var error = function error() {
        return reject(new Error("Couldn't start swarm process."));
      };
      var timeout = setTimeout(error, 20000);
    });
  };

  // Process ~> Promise ()
  //   Stops the Swarm process.
  var stopProcess = function stopProcess(process) {
    return new Promise(function (resolve, reject) {
      process.stderr.removeAllListeners('data');
      process.stdout.removeAllListeners('data');
      process.stdin.removeAllListeners('error');
      process.removeAllListeners('error');
      process.removeAllListeners('exit');
      process.kill('SIGINT');

      var killTimeout = setTimeout(function () {
        return process.kill('SIGKILL');
      }, 8000);

      process.once('close', function () {
        clearTimeout(killTimeout);
        resolve();
      });
    });
  };

  // SwarmSetup -> (SwarmAPI -> Promise ()) -> Promise ()
  //   Receives a Swarm configuration object and a callback function. It then
  //   checks if a local Swarm node is running. If no local Swarm is found, it
  //   downloads the Swarm binaries to the dataDir (if not there), checksums,
  //   starts the Swarm process and calls the callback function with an API
  //   object using the local node. That callback must return a promise which
  //   will resolve when it is done using the API, so that this function can
  //   close the Swarm process properly. Returns a promise that resolves when the
  //   user is done with the API and the Swarm process is closed.
  //   TODO: check if Swarm process is already running (improve `isAvailable`)
  var local = function local(swarmSetup) {
    return function (useAPI) {
      return _isAvailable("http://localhost:8500").then(function (isAvailable) {
        return isAvailable ? useAPI(at("http://localhost:8500")).then(function () {}) : downloadBinary(swarmSetup.binPath, swarmSetup.archives).onData(function (data) {
          return (swarmSetup.onProgress || function () {})(data.length);
        }).then(function () {
          return startProcess(swarmSetup);
        }).then(function (process) {
          return useAPI(at("http://localhost:8500")).then(function () {
            return process;
          });
        }).then(stopProcess);
      });
    };
  };

  // String ~> Promise Bool
  //   Returns true if Swarm is available on `url`.
  //   Perfoms a test upload to determine that.
  //   TODO: improve this?
  var _isAvailable = function _isAvailable(swarmUrl) {
    var testFile = "test";
    var testHash = "c9a99c7d326dcc6316f32fe2625b311f6dc49a175e6877681ded93137d3569e7";
    return uploadData(swarmUrl)(testFile).then(function (hash) {
      return hash === testHash;
    }).catch(function () {
      return false;
    });
  };

  // String -> String ~> Promise Bool
  //   Returns a Promise which is true if that Swarm address is a directory.
  //   Determines that by checking that it (i) is a JSON, (ii) has a .entries.
  //   TODO: improve this?
  var isDirectory = function isDirectory(swarmUrl) {
    return function (hash) {
      return downloadData(swarmUrl)(hash).then(function (data) {
        try {
          return !!JSON.parse(toString(data)).entries;
        } catch (e) {
          return false;
        }
      });
    };
  };

  // Uncurries a function; used to allow the f(x,y,z) style on exports.
  var uncurry = function uncurry(f) {
    return function (a, b, c, d, e) {
      var p;
      // Hardcoded because efficiency (`arguments` is very slow).
      if (typeof a !== "undefined") p = f(a);
      if (typeof b !== "undefined") p = f(b);
      if (typeof c !== "undefined") p = f(c);
      if (typeof d !== "undefined") p = f(d);
      if (typeof e !== "undefined") p = f(e);
      return p;
    };
  };

  // () -> Promise Bool
  //   Not sure how to mock Swarm to test it properly. Ideas?
  var test = function test() {
    return Promise.resolve(true);
  };

  // Uint8Array -> String
  var toString = function toString(uint8Array) {
    return bytes.toString(bytes.fromUint8Array(uint8Array));
  };

  // String -> Uint8Array
  var fromString = function fromString(string) {
    return bytes.toUint8Array(bytes.fromString(string));
  };

  // String -> SwarmAPI
  //   Fixes the `swarmUrl`, returning an API where you don't have to pass it.
  var at = function at(swarmUrl) {
    return {
      download: function download(hash, path) {
        return _download(swarmUrl)(hash)(path);
      },
      downloadData: uncurry(downloadData(swarmUrl)),
      downloadDataToDisk: uncurry(downloadDataToDisk(swarmUrl)),
      downloadDirectory: uncurry(downloadDirectory(swarmUrl)),
      downloadDirectoryToDisk: uncurry(downloadDirectoryToDisk(swarmUrl)),
      downloadEntries: uncurry(downloadEntries(swarmUrl)),
      downloadRoutes: uncurry(downloadRoutes(swarmUrl)),
      isAvailable: function isAvailable() {
        return _isAvailable(swarmUrl);
      },
      upload: function upload(arg) {
        return _upload(swarmUrl)(arg);
      },
      uploadData: uncurry(uploadData(swarmUrl)),
      uploadFile: uncurry(uploadFile(swarmUrl)),
      uploadFileFromDisk: uncurry(uploadFile(swarmUrl)),
      uploadDataFromDisk: uncurry(uploadDataFromDisk(swarmUrl)),
      uploadDirectory: uncurry(uploadDirectory(swarmUrl)),
      uploadDirectoryFromDisk: uncurry(uploadDirectoryFromDisk(swarmUrl)),
      uploadToManifest: uncurry(uploadToManifest(swarmUrl)),
      pick: pick,
      hash: hash,
      fromString: fromString,
      toString: toString
    };
  };

  return {
    at: at,
    local: local,
    download: _download,
    downloadBinary: downloadBinary,
    downloadData: downloadData,
    downloadDataToDisk: downloadDataToDisk,
    downloadDirectory: downloadDirectory,
    downloadDirectoryToDisk: downloadDirectoryToDisk,
    downloadEntries: downloadEntries,
    downloadRoutes: downloadRoutes,
    isAvailable: _isAvailable,
    startProcess: startProcess,
    stopProcess: stopProcess,
    upload: _upload,
    uploadData: uploadData,
    uploadDataFromDisk: uploadDataFromDisk,
    uploadFile: uploadFile,
    uploadFileFromDisk: uploadFileFromDisk,
    uploadDirectory: uploadDirectory,
    uploadDirectoryFromDisk: uploadDirectoryFromDisk,
    uploadToManifest: uploadToManifest,
    pick: pick,
    hash: hash,
    fromString: fromString,
    toString: toString
  };
};

},{}],351:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],352:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key,value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `!0`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading:!1}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key,value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0===-0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null==undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
var noMatch=/(.)^/;var escapes={"'":"'",'\\':'\\','\r':'r','\n':'n','\u2028':'u2028','\u2029':'u2029'};var escaper=/\\|'|\r|\n|\u2028|\u2029/g;var escapeChar=function(match){return'\\'+escapes[match]};_.template=function(text,settings,oldSettings){if(!settings&&oldSettings)settings=oldSettings;settings=_.defaults({},settings,_.templateSettings);var matcher=RegExp([(settings.escape||noMatch).source,(settings.interpolate||noMatch).source,(settings.evaluate||noMatch).source].join('|')+'|$','g');var index=0;var source="__p+='";text.replace(matcher,function(match,escape,interpolate,evaluate,offset){source+=text.slice(index,offset).replace(escaper,escapeChar);index=offset+match.length;if(escape){source+="'+\n((__t=("+escape+"))==null?'':_.escape(__t))+\n'"}else if(interpolate){source+="'+\n((__t=("+interpolate+"))==null?'':__t)+\n'"}else if(evaluate){source+="';\n"+evaluate+"\n__p+='"}
return match});source+="';\n";if(!settings.variable)source='with(obj||{}){\n'+source+'}\n';source="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'')};\n"+source+'return __p;\n';try{var render=new Function(settings.variable||'obj','_',source)}catch(e){e.source=source;throw e}
var template=function(data){return render.call(this,data,_)};var argument=settings.variable||'obj';template.source='function('+argument+'){\n'+source+'}';return template};_.chain=function(obj){var instance=_(obj);instance._chain=!0;return instance};var result=function(instance,obj){return instance._chain?_(obj).chain():obj};_.mixin=function(obj){_.each(_.functions(obj),function(name){var func=_[name]=obj[name];_.prototype[name]=function(){var args=[this._wrapped];push.apply(args,arguments);return result(this,func.apply(_,args))}})};_.mixin(_);_.each(['pop','push','reverse','shift','sort','splice','unshift'],function(name){var method=ArrayProto[name];_.prototype[name]=function(){var obj=this._wrapped;method.apply(obj,arguments);if((name==='shift'||name==='splice')&&obj.length===0)delete obj[0];return result(this,obj)}});_.each(['concat','join','slice'],function(name){var method=ArrayProto[name];_.prototype[name]=function(){return result(this,method.apply(this._wrapped,arguments))}});_.prototype.value=function(){return this._wrapped};_.prototype.valueOf=_.prototype.toJSON=_.prototype.value;_.prototype.toString=function(){return''+this._wrapped};if(typeof define==='function'&&define.amd){define('underscore',[],function(){return _})}}.call(this))},{}],353:[function(require,module,exports){module.exports=urlSetQuery
function urlSetQuery(url,query){if(query){query=query.trim().replace(/^(\?|#|&)/,'')
query=query?('?'+query):query
var parts=url.split(/[\?\#]/)
var start=parts[0]
if(query&&/\:\/\/[^\/]*$/.test(start)){start=start+'/'}
var match=url.match(/(\#.*)$/)
url=start+query
if(match){url=url+match[0]}}
return url}},{}],354:[function(require,module,exports){(function(global){;(function(root){var freeExports=typeof exports=='object'&&exports;var freeModule=typeof module=='object'&&module&&module.exports==freeExports&&module;var freeGlobal=typeof global=='object'&&global;if(freeGlobal.global===freeGlobal||freeGlobal.window===freeGlobal){root=freeGlobal}
var stringFromCharCode=String.fromCharCode;function ucs2decode(string){var output=[];var counter=0;var length=string.length;var value;var extra;while(counter<length){value=string.charCodeAt(counter++);if(value>=0xD800&&value<=0xDBFF&&counter<length){extra=string.charCodeAt(counter++);if((extra&0xFC00)==0xDC00){output.push(((value&0x3FF)<<10)+(extra&0x3FF)+0x10000)}else{output.push(value);counter--}}else{output.push(value)}}
return output}
function ucs2encode(array){var length=array.length;var index=-1;var value;var output='';while(++index<length){value=array[index];if(value>0xFFFF){value-=0x10000;output+=stringFromCharCode(value>>>10&0x3FF|0xD800);value=0xDC00|value&0x3FF}
output+=stringFromCharCode(value)}
return output}
function checkScalarValue(codePoint){if(codePoint>=0xD800&&codePoint<=0xDFFF){throw Error('Lone surrogate U+'+codePoint.toString(16).toUpperCase()+' is not a scalar value')}}
function createByte(codePoint,shift){return stringFromCharCode(((codePoint>>shift)&0x3F)|0x80)}
function encodeCodePoint(codePoint){if((codePoint&0xFFFFFF80)==0){return stringFromCharCode(codePoint)}
var symbol='';if((codePoint&0xFFFFF800)==0){symbol=stringFromCharCode(((codePoint>>6)&0x1F)|0xC0)}
else if((codePoint&0xFFFF0000)==0){checkScalarValue(codePoint);symbol=stringFromCharCode(((codePoint>>12)&0x0F)|0xE0);symbol+=createByte(codePoint,6)}
else if((codePoint&0xFFE00000)==0){symbol=stringFromCharCode(((codePoint>>18)&0x07)|0xF0);symbol+=createByte(codePoint,12);symbol+=createByte(codePoint,6)}
symbol+=stringFromCharCode((codePoint&0x3F)|0x80);return symbol}
function utf8encode(string){var codePoints=ucs2decode(string);var length=codePoints.length;var index=-1;var codePoint;var byteString='';while(++index<length){codePoint=codePoints[index];byteString+=encodeCodePoint(codePoint)}
return byteString}
function readContinuationByte(){if(byteIndex>=byteCount){throw Error('Invalid byte index')}
var continuationByte=byteArray[byteIndex]&0xFF;byteIndex++;if((continuationByte&0xC0)==0x80){return continuationByte&0x3F}
throw Error('Invalid continuation byte')}
function decodeSymbol(){var byte1;var byte2;var byte3;var byte4;var codePoint;if(byteIndex>byteCount){throw Error('Invalid byte index')}
if(byteIndex==byteCount){return!1}
byte1=byteArray[byteIndex]&0xFF;byteIndex++;if((byte1&0x80)==0){return byte1}
if((byte1&0xE0)==0xC0){var byte2=readContinuationByte();codePoint=((byte1&0x1F)<<6)|byte2;if(codePoint>=0x80){return codePoint}else{throw Error('Invalid continuation byte')}}
if((byte1&0xF0)==0xE0){byte2=readContinuationByte();byte3=readContinuationByte();codePoint=((byte1&0x0F)<<12)|(byte2<<6)|byte3;if(codePoint>=0x0800){checkScalarValue(codePoint);return codePoint}else{throw Error('Invalid continuation byte')}}
if((byte1&0xF8)==0xF0){byte2=readContinuationByte();byte3=readContinuationByte();byte4=readContinuationByte();codePoint=((byte1&0x0F)<<0x12)|(byte2<<0x0C)|(byte3<<0x06)|byte4;if(codePoint>=0x010000&&codePoint<=0x10FFFF){return codePoint}}
throw Error('Invalid UTF-8 detected')}
var byteArray;var byteCount;var byteIndex;function utf8decode(byteString){byteArray=ucs2decode(byteString);byteCount=byteArray.length;byteIndex=0;var codePoints=[];var tmp;while((tmp=decodeSymbol())!==!1){codePoints.push(tmp)}
return ucs2encode(codePoints)}
var utf8={'version':'2.0.0','encode':utf8encode,'decode':utf8decode};if(typeof define=='function'&&typeof define.amd=='object'&&define.amd){define(function(){return utf8})}else if(freeExports&&!freeExports.nodeType){if(freeModule){freeModule.exports=utf8}else{var object={};var hasOwnProperty=object.hasOwnProperty;for(var key in utf8){hasOwnProperty.call(utf8,key)&&(freeExports[key]=utf8[key])}}}else{root.utf8=utf8}}(this))}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],355:[function(require,module,exports){"use strict";var _=require('underscore');var swarm=require("swarm-js");var Bzz=function Bzz(provider){this.givenProvider=Bzz.givenProvider;if(provider&&provider._requestManager){provider=provider.currentProvider}
if(typeof document!=='undefined'){this.pick=swarm.pick}
this.setProvider(provider)};Bzz.givenProvider=null;if(typeof ethereumProvider!=='undefined'&&ethereumProvider.bzz){Bzz.givenProvider=ethereumProvider.bzz}
Bzz.prototype.setProvider=function(provider){if(_.isObject(provider)&&_.isString(provider.bzz)){provider=provider.bzz}
if(_.isString(provider)){this.currentProvider=provider}else{this.currentProvider=null;var noProviderError=new Error('No provider set, please set one using bzz.setProvider().');this.download=this.upload=this.isAvailable=function(){throw noProviderError};return!1}
this.download=swarm.at(provider).download;this.upload=swarm.at(provider).upload;this.isAvailable=swarm.at(provider).isAvailable;return!0};module.exports=Bzz},{"swarm-js":347,"underscore":352}],356:[function(require,module,exports){"use strict";module.exports={ErrorResponse:function(result){var message=!!result&&!!result.error&&!!result.error.message?result.error.message:JSON.stringify(result);return new Error('Returned error: '+message)},InvalidNumberOfParams:function(got,expected,method){return new Error('Invalid number of parameters for "'+method+'". Got '+got+' expected '+expected+'!')},InvalidConnection:function(host){return new Error('CONNECTION ERROR: Couldn\'t connect to node '+host+'.')},InvalidProvider:function(){return new Error('Provider not set or invalid')},InvalidResponse:function(result){var message=!!result&&!!result.error&&!!result.error.message?result.error.message:'Invalid JSON RPC response: '+JSON.stringify(result);return new Error(message)},ConnectionTimeout:function(ms){return new Error('CONNECTION TIMEOUT: timeout of '+ms+' ms achived')}}},{}],357:[function(require,module,exports){"use strict";var _=require('underscore');var utils=require('web3-utils');var Iban=require('web3-eth-iban');var outputBigNumberFormatter=function(number){return utils.toBN(number).toString(10)};var isPredefinedBlockNumber=function(blockNumber){return blockNumber==='latest'||blockNumber==='pending'||blockNumber==='earliest'};var inputDefaultBlockNumberFormatter=function(blockNumber){if(this&&(blockNumber===undefined||blockNumber===null)){return this.defaultBlock}
if(blockNumber==='genesis'||blockNumber==='earliest'){return'0x0'}
return inputBlockNumberFormatter(blockNumber)};var inputBlockNumberFormatter=function(blockNumber){if(blockNumber===undefined){return undefined}else if(isPredefinedBlockNumber(blockNumber)){return blockNumber}
return(utils.isHexStrict(blockNumber))?((_.isString(blockNumber))?blockNumber.toLowerCase():blockNumber):utils.numberToHex(blockNumber)};var _txInputFormatter=function(options){if(options.to){options.to=inputAddressFormatter(options.to)}
if(options.data&&options.input){throw new Error('You can\'t have "data" and "input" as properties of transactions at the same time, please use either "data" or "input" instead.')}
if(!options.data&&options.input){options.data=options.input;delete options.input}
if(options.data&&!utils.isHex(options.data)){throw new Error('The data field must be HEX encoded data.')}
if(options.gas||options.gasLimit){options.gas=options.gas||options.gasLimit}['gasPrice','gas','value','nonce'].filter(function(key){return options[key]!==undefined}).forEach(function(key){options[key]=utils.numberToHex(options[key])});return options};var inputCallFormatter=function(options){options=_txInputFormatter(options);var from=options.from||(this?this.defaultAccount:null);if(from){options.from=inputAddressFormatter(from)}
return options};var inputTransactionFormatter=function(options){options=_txInputFormatter(options);if(!_.isNumber(options.from)&&!_.isObject(options.from)){options.from=options.from||(this?this.defaultAccount:null);if(!options.from&&!_.isNumber(options.from)){throw new Error('The send transactions "from" field must be defined!')}
options.from=inputAddressFormatter(options.from)}
return options};var inputSignFormatter=function(data){return(utils.isHexStrict(data))?data:utils.utf8ToHex(data)};var outputTransactionFormatter=function(tx){if(tx.blockNumber!==null)
tx.blockNumber=utils.hexToNumber(tx.blockNumber);if(tx.transactionIndex!==null)
tx.transactionIndex=utils.hexToNumber(tx.transactionIndex);tx.nonce=utils.hexToNumber(tx.nonce);tx.gas=utils.hexToNumber(tx.gas);tx.gasPrice=outputBigNumberFormatter(tx.gasPrice);tx.value=outputBigNumberFormatter(tx.value);if(tx.to&&utils.isAddress(tx.to)){tx.to=utils.toChecksumAddress(tx.to)}else{tx.to=null}
if(tx.from){tx.from=utils.toChecksumAddress(tx.from)}
return tx};var outputTransactionReceiptFormatter=function(receipt){if(typeof receipt!=='object'){throw new Error('Received receipt is invalid: '+receipt)}
if(receipt.blockNumber!==null)
receipt.blockNumber=utils.hexToNumber(receipt.blockNumber);if(receipt.transactionIndex!==null)
receipt.transactionIndex=utils.hexToNumber(receipt.transactionIndex);receipt.cumulativeGasUsed=utils.hexToNumber(receipt.cumulativeGasUsed);receipt.gasUsed=utils.hexToNumber(receipt.gasUsed);if(_.isArray(receipt.logs)){receipt.logs=receipt.logs.map(outputLogFormatter)}
if(receipt.contractAddress){receipt.contractAddress=utils.toChecksumAddress(receipt.contractAddress)}
if(typeof receipt.status!=='undefined'){receipt.status=Boolean(parseInt(receipt.status))}
return receipt};var outputBlockFormatter=function(block){block.gasLimit=utils.hexToNumber(block.gasLimit);block.gasUsed=utils.hexToNumber(block.gasUsed);block.size=utils.hexToNumber(block.size);block.timestamp=utils.hexToNumber(block.timestamp);if(block.number!==null)
block.number=utils.hexToNumber(block.number);if(block.difficulty)
block.difficulty=outputBigNumberFormatter(block.difficulty);if(block.totalDifficulty)
block.totalDifficulty=outputBigNumberFormatter(block.totalDifficulty);if(_.isArray(block.transactions)){block.transactions.forEach(function(item){if(!_.isString(item))
return outputTransactionFormatter(item)})}
if(block.miner)
block.miner=utils.toChecksumAddress(block.miner);return block};var inputLogFormatter=function(options){var toTopic=function(value){if(value===null||typeof value==='undefined')
return null;value=String(value);if(value.indexOf('0x')===0)
return value;else return utils.fromUtf8(value)};if(options.fromBlock)
options.fromBlock=inputBlockNumberFormatter(options.fromBlock);if(options.toBlock)
options.toBlock=inputBlockNumberFormatter(options.toBlock);options.topics=options.topics||[];options.topics=options.topics.map(function(topic){return(_.isArray(topic))?topic.map(toTopic):toTopic(topic)});toTopic=null;if(options.address){options.address=(_.isArray(options.address))?options.address.map(function(addr){return inputAddressFormatter(addr)}):inputAddressFormatter(options.address)}
return options};var outputLogFormatter=function(log){if(typeof log.blockHash==='string'&&typeof log.transactionHash==='string'&&typeof log.logIndex==='string'){var shaId=utils.sha3(log.blockHash.replace('0x','')+log.transactionHash.replace('0x','')+log.logIndex.replace('0x',''));log.id='log_'+shaId.replace('0x','').substr(0,8)}else if(!log.id){log.id=null}
if(log.blockNumber!==null)
log.blockNumber=utils.hexToNumber(log.blockNumber);if(log.transactionIndex!==null)
log.transactionIndex=utils.hexToNumber(log.transactionIndex);if(log.logIndex!==null)
log.logIndex=utils.hexToNumber(log.logIndex);if(log.address){log.address=utils.toChecksumAddress(log.address)}
return log};var inputPostFormatter=function(post){if(post.ttl)
post.ttl=utils.numberToHex(post.ttl);if(post.workToProve)
post.workToProve=utils.numberToHex(post.workToProve);if(post.priority)
post.priority=utils.numberToHex(post.priority);if(!_.isArray(post.topics)){post.topics=post.topics?[post.topics]:[]}
post.topics=post.topics.map(function(topic){return(topic.indexOf('0x')===0)?topic:utils.fromUtf8(topic)});return post};var outputPostFormatter=function(post){post.expiry=utils.hexToNumber(post.expiry);post.sent=utils.hexToNumber(post.sent);post.ttl=utils.hexToNumber(post.ttl);post.workProved=utils.hexToNumber(post.workProved);if(!post.topics){post.topics=[]}
post.topics=post.topics.map(function(topic){return utils.toUtf8(topic)});return post};var inputAddressFormatter=function(address){var iban=new Iban(address);if(iban.isValid()&&iban.isDirect()){return iban.toAddress().toLowerCase()}else if(utils.isAddress(address)){return'0x'+address.toLowerCase().replace('0x','')}
throw new Error('Provided address "'+address+'" is invalid, the capitalization checksum test failed, or its an indrect IBAN address which can\'t be converted.')};var outputSyncingFormatter=function(result){result.startingBlock=utils.hexToNumber(result.startingBlock);result.currentBlock=utils.hexToNumber(result.currentBlock);result.highestBlock=utils.hexToNumber(result.highestBlock);if(result.knownStates){result.knownStates=utils.hexToNumber(result.knownStates);result.pulledStates=utils.hexToNumber(result.pulledStates)}
return result};module.exports={inputDefaultBlockNumberFormatter:inputDefaultBlockNumberFormatter,inputBlockNumberFormatter:inputBlockNumberFormatter,inputCallFormatter:inputCallFormatter,inputTransactionFormatter:inputTransactionFormatter,inputAddressFormatter:inputAddressFormatter,inputPostFormatter:inputPostFormatter,inputLogFormatter:inputLogFormatter,inputSignFormatter:inputSignFormatter,outputBigNumberFormatter:outputBigNumberFormatter,outputTransactionFormatter:outputTransactionFormatter,outputTransactionReceiptFormatter:outputTransactionReceiptFormatter,outputBlockFormatter:outputBlockFormatter,outputLogFormatter:outputLogFormatter,outputPostFormatter:outputPostFormatter,outputSyncingFormatter:outputSyncingFormatter}},{"underscore":352,"web3-eth-iban":388,"web3-utils":398}],358:[function(require,module,exports){"use strict";var errors=require('./errors');var formatters=require('./formatters');module.exports={errors:errors,formatters:formatters}},{"./errors":356,"./formatters":357}],359:[function(require,module,exports){"use strict";var _=require('underscore');var errors=require('web3-core-helpers').errors;var formatters=require('web3-core-helpers').formatters;var utils=require('web3-utils');var promiEvent=require('web3-core-promievent');var Subscriptions=require('web3-core-subscriptions').subscriptions;var TIMEOUTBLOCK=50;var POLLINGTIMEOUT=15*TIMEOUTBLOCK;var CONFIRMATIONBLOCKS=24;var Method=function Method(options){if(!options.call||!options.name){throw new Error('When creating a method you need to provide at least the "name" and "call" property.')}
this.name=options.name;this.call=options.call;this.params=options.params||0;this.inputFormatter=options.inputFormatter;this.outputFormatter=options.outputFormatter;this.transformPayload=options.transformPayload;this.extraFormatters=options.extraFormatters;this.requestManager=options.requestManager;this.accounts=options.accounts;this.defaultBlock=options.defaultBlock||'latest';this.defaultAccount=options.defaultAccount||null};Method.prototype.setRequestManager=function(requestManager,accounts){this.requestManager=requestManager;if(accounts){this.accounts=accounts}};Method.prototype.createFunction=function(requestManager,accounts){var func=this.buildCall();func.call=this.call;this.setRequestManager(requestManager||this.requestManager,accounts||this.accounts);return func};Method.prototype.attachToObject=function(obj){var func=this.buildCall();func.call=this.call;var name=this.name.split('.');if(name.length>1){obj[name[0]]=obj[name[0]]||{};obj[name[0]][name[1]]=func}else{obj[name[0]]=func}};Method.prototype.getCall=function(args){return _.isFunction(this.call)?this.call(args):this.call};Method.prototype.extractCallback=function(args){if(_.isFunction(args[args.length-1])){return args.pop()}};Method.prototype.validateArgs=function(args){if(args.length!==this.params){throw errors.InvalidNumberOfParams(args.length,this.params,this.name)}};Method.prototype.formatInput=function(args){var _this=this;if(!this.inputFormatter){return args}
return this.inputFormatter.map(function(formatter,index){return formatter?formatter.call(_this,args[index]):args[index]})};Method.prototype.formatOutput=function(result){var _this=this;if(_.isArray(result)){return result.map(function(res){return _this.outputFormatter&&res?_this.outputFormatter(res):res})}else{return this.outputFormatter&&result?this.outputFormatter(result):result}};Method.prototype.toPayload=function(args){var call=this.getCall(args);var callback=this.extractCallback(args);var params=this.formatInput(args);this.validateArgs(params);var payload={method:call,params:params,callback:callback};if(this.transformPayload){payload=this.transformPayload(payload)}
return payload};Method.prototype._confirmTransaction=function(defer,result,payload){var method=this,promiseResolved=!1,canUnsubscribe=!0,timeoutCount=0,confirmationCount=0,intervalId=null,receiptJSON='',gasProvided=(_.isObject(payload.params[0])&&payload.params[0].gas)?payload.params[0].gas:null,isContractDeployment=_.isObject(payload.params[0])&&payload.params[0].data&&payload.params[0].from&&!payload.params[0].to;var _ethereumCalls=[new Method({name:'getTransactionReceipt',call:'eth_getTransactionReceipt',params:1,inputFormatter:[null],outputFormatter:formatters.outputTransactionReceiptFormatter}),new Method({name:'getCode',call:'eth_getCode',params:2,inputFormatter:[formatters.inputAddressFormatter,formatters.inputDefaultBlockNumberFormatter]}),new Subscriptions({name:'subscribe',type:'eth',subscriptions:{'newBlockHeaders':{subscriptionName:'newHeads',params:0,outputFormatter:formatters.outputBlockFormatter}}})];var _ethereumCall={};_.each(_ethereumCalls,function(mthd){mthd.attachToObject(_ethereumCall);mthd.requestManager=method.requestManager});var checkConfirmation=function(existingReceipt,isPolling,err,blockHeader,sub){if(!err){if(!sub){sub={unsubscribe:function(){clearInterval(intervalId)}}}
return(existingReceipt?promiEvent.resolve(existingReceipt):_ethereumCall.getTransactionReceipt(result)).catch(function(err){sub.unsubscribe();promiseResolved=!0;utils._fireError({message:'Failed to check for transaction receipt:',data:err},defer.eventEmitter,defer.reject)}).then(function(receipt){if(!receipt||!receipt.blockHash){throw new Error('Receipt missing or blockHash null')}
if(method.extraFormatters&&method.extraFormatters.receiptFormatter){receipt=method.extraFormatters.receiptFormatter(receipt)}
if(defer.eventEmitter.listeners('confirmation').length>0){if(existingReceipt===undefined||confirmationCount!==0){defer.eventEmitter.emit('confirmation',confirmationCount,receipt)}
canUnsubscribe=!1;confirmationCount++;if(confirmationCount===CONFIRMATIONBLOCKS+1){sub.unsubscribe();defer.eventEmitter.removeAllListeners()}}
return receipt}).then(function(receipt){if(isContractDeployment&&!promiseResolved){if(!receipt.contractAddress){if(canUnsubscribe){sub.unsubscribe();promiseResolved=!0}
utils._fireError(new Error('The transaction receipt didn\'t contain a contract address.'),defer.eventEmitter,defer.reject);return}
_ethereumCall.getCode(receipt.contractAddress,function(e,code){if(!code){return}
if(code.length>2){defer.eventEmitter.emit('receipt',receipt);if(method.extraFormatters&&method.extraFormatters.contractDeployFormatter){defer.resolve(method.extraFormatters.contractDeployFormatter(receipt))}else{defer.resolve(receipt)}
if(canUnsubscribe){defer.eventEmitter.removeAllListeners()}}else{utils._fireError(new Error('The contract code couldn\'t be stored, please check your gas limit.'),defer.eventEmitter,defer.reject)}
if(canUnsubscribe){sub.unsubscribe()}
promiseResolved=!0})}
return receipt}).then(function(receipt){if(!isContractDeployment&&!promiseResolved){if(!receipt.outOfGas&&(!gasProvided||gasProvided!==receipt.gasUsed)&&(receipt.status===!0||receipt.status==='0x1'||typeof receipt.status==='undefined')){defer.eventEmitter.emit('receipt',receipt);defer.resolve(receipt);if(canUnsubscribe){defer.eventEmitter.removeAllListeners()}}else{receiptJSON=JSON.stringify(receipt,null,2);if(receipt.status===!1||receipt.status==='0x0'){utils._fireError(new Error("Transaction has been reverted by the EVM:\n"+receiptJSON),defer.eventEmitter,defer.reject)}else{utils._fireError(new Error("Transaction ran out of gas. Please provide more gas:\n"+receiptJSON),defer.eventEmitter,defer.reject)}}
if(canUnsubscribe){sub.unsubscribe()}
promiseResolved=!0}}).catch(function(){timeoutCount++;if(!!isPolling){if(timeoutCount-1>=POLLINGTIMEOUT){sub.unsubscribe();promiseResolved=!0;utils._fireError(new Error('Transaction was not mined within'+POLLINGTIMEOUT+' seconds, please make sure your transaction was properly sent. Be aware that it might still be mined!'),defer.eventEmitter,defer.reject)}}else{if(timeoutCount-1>=TIMEOUTBLOCK){sub.unsubscribe();promiseResolved=!0;utils._fireError(new Error('Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'),defer.eventEmitter,defer.reject)}}})}else{sub.unsubscribe();promiseResolved=!0;utils._fireError({message:'Failed to subscribe to new newBlockHeaders to confirm the transaction receipts.',data:err},defer.eventEmitter,defer.reject)}};var startWatching=function(existingReceipt){if(_.isFunction(this.requestManager.provider.on)){_ethereumCall.subscribe('newBlockHeaders',checkConfirmation.bind(null,existingReceipt,!1))}else{intervalId=setInterval(checkConfirmation.bind(null,existingReceipt,!0),1000)}}.bind(this);_ethereumCall.getTransactionReceipt(result).then(function(receipt){if(receipt&&receipt.blockHash){if(defer.eventEmitter.listeners('confirmation').length>0){startWatching(receipt)}
checkConfirmation(receipt,!1)}else if(!promiseResolved){startWatching()}}).catch(function(){if(!promiseResolved)startWatching()})};var getWallet=function(from,accounts){var wallet=null;if(_.isNumber(from)){wallet=accounts.wallet[from]}else if(_.isObject(from)&&from.address&&from.privateKey){wallet=from}else{wallet=accounts.wallet[from.toLowerCase()]}
return wallet};Method.prototype.buildCall=function(){var method=this,isSendTx=(method.call==='eth_sendTransaction'||method.call==='eth_sendRawTransaction');var send=function(){var defer=promiEvent(!isSendTx),payload=method.toPayload(Array.prototype.slice.call(arguments));var sendTxCallback=function(err,result){try{result=method.formatOutput(result)}catch(e){err=e}
if(result instanceof Error){err=result}
if(!err){if(payload.callback){payload.callback(null,result)}}else{if(err.error){err=err.error}
return utils._fireError(err,defer.eventEmitter,defer.reject,payload.callback)}
if(!isSendTx){if(!err){defer.resolve(result)}}else{defer.eventEmitter.emit('transactionHash',result);method._confirmTransaction(defer,result,payload)}};var sendSignedTx=function(sign){var signedPayload=_.extend({},payload,{method:'eth_sendRawTransaction',params:[sign.rawTransaction]});method.requestManager.send(signedPayload,sendTxCallback)};var sendRequest=function(payload,method){if(method&&method.accounts&&method.accounts.wallet&&method.accounts.wallet.length){var wallet;if(payload.method==='eth_sendTransaction'){var tx=payload.params[0];wallet=getWallet((_.isObject(tx))?tx.from:null,method.accounts);if(wallet&&wallet.privateKey){return method.accounts.signTransaction(_.omit(tx,'from'),wallet.privateKey).then(sendSignedTx)}}else if(payload.method==='eth_sign'){var data=payload.params[1];wallet=getWallet(payload.params[0],method.accounts);if(wallet&&wallet.privateKey){var sign=method.accounts.sign(data,wallet.privateKey);if(payload.callback){payload.callback(null,sign.signature)}
defer.resolve(sign.signature);return}}}
return method.requestManager.send(payload,sendTxCallback)};if(isSendTx&&_.isObject(payload.params[0])&&typeof payload.params[0].gasPrice==='undefined'){var getGasPrice=(new Method({name:'getGasPrice',call:'eth_gasPrice',params:0})).createFunction(method.requestManager);getGasPrice(function(err,gasPrice){if(gasPrice){payload.params[0].gasPrice=gasPrice}
sendRequest(payload,method)})}else{sendRequest(payload,method)}
return defer.eventEmitter};send.method=method;send.request=this.request.bind(this);return send};Method.prototype.request=function(){var payload=this.toPayload(Array.prototype.slice.call(arguments));payload.format=this.formatOutput.bind(this);return payload};module.exports=Method},{"underscore":352,"web3-core-helpers":358,"web3-core-promievent":360,"web3-core-subscriptions":365,"web3-utils":398}],360:[function(require,module,exports){"use strict";var EventEmitter=require('eventemitter3');var Promise=require("any-promise");var PromiEvent=function PromiEvent(justPromise){var resolve,reject,eventEmitter=new Promise(function(){resolve=arguments[0];reject=arguments[1]});if(justPromise){return{resolve:resolve,reject:reject,eventEmitter:eventEmitter}}
var emitter=new EventEmitter();eventEmitter._events=emitter._events;eventEmitter.emit=emitter.emit;eventEmitter.on=emitter.on;eventEmitter.once=emitter.once;eventEmitter.off=emitter.off;eventEmitter.listeners=emitter.listeners;eventEmitter.addListener=emitter.addListener;eventEmitter.removeListener=emitter.removeListener;eventEmitter.removeAllListeners=emitter.removeAllListeners;return{resolve:resolve,reject:reject,eventEmitter:eventEmitter}};PromiEvent.resolve=function(value){var promise=PromiEvent(!0);promise.resolve(value);return promise.eventEmitter};module.exports=PromiEvent},{"any-promise":178,"eventemitter3":278}],361:[function(require,module,exports){"use strict";var Jsonrpc=require('./jsonrpc');var errors=require('web3-core-helpers').errors;var Batch=function(requestManager){this.requestManager=requestManager;this.requests=[]};Batch.prototype.add=function(request){this.requests.push(request)};Batch.prototype.execute=function(){var requests=this.requests;this.requestManager.sendBatch(requests,function(err,results){results=results||[];requests.map(function(request,index){return results[index]||{}}).forEach(function(result,index){if(requests[index].callback){if(result&&result.error){return requests[index].callback(errors.ErrorResponse(result))}
if(!Jsonrpc.isValidResponse(result)){return requests[index].callback(errors.InvalidResponse(result))}
try{requests[index].callback(null,requests[index].format?requests[index].format(result.result):result.result)}catch(err){requests[index].callback(err)}}})})};module.exports=Batch},{"./jsonrpc":364,"web3-core-helpers":358}],362:[function(require,module,exports){"use strict";var givenProvider=null;var global=Function('return this')();if(typeof global.ethereumProvider!=='undefined'){givenProvider=global.ethereumProvider}else if(typeof global.web3!=='undefined'&&global.web3.currentProvider){if(global.web3.currentProvider.sendAsync){global.web3.currentProvider.send=global.web3.currentProvider.sendAsync;delete global.web3.currentProvider.sendAsync}
if(!global.web3.currentProvider.on&&global.web3.currentProvider.connection&&global.web3.currentProvider.connection.constructor.name==='ipcProviderWrapper'){global.web3.currentProvider.on=function(type,callback){if(typeof callback!=='function')
throw new Error('The second parameter callback must be a function.');switch(type){case 'data':this.connection.on('data',function(data){var result='';data=data.toString();try{result=JSON.parse(data)}catch(e){return callback(new Error('Couldn\'t parse response data'+data))}
if(!result.id&&result.method.indexOf('_subscription')!==-1){callback(null,result)}});break;default:this.connection.on(type,callback);break}}}
givenProvider=global.web3.currentProvider}
module.exports=givenProvider},{}],363:[function(require,module,exports){"use strict";var _=require('underscore');var errors=require('web3-core-helpers').errors;var Jsonrpc=require('./jsonrpc.js');var BatchManager=require('./batch.js');var givenProvider=require('./givenProvider.js');var RequestManager=function RequestManager(provider){this.provider=null;this.providers=RequestManager.providers;this.setProvider(provider);this.subscriptions={}};RequestManager.givenProvider=givenProvider;RequestManager.providers={WebsocketProvider:require('web3-providers-ws'),HttpProvider:require('web3-providers-http'),IpcProvider:require('web3-providers-ipc')};RequestManager.prototype.setProvider=function(p,net){var _this=this;if(p&&typeof p==='string'&&this.providers){if(/^http(s)?:\/\//i.test(p)){p=new this.providers.HttpProvider(p)}else if(/^ws(s)?:\/\//i.test(p)){p=new this.providers.WebsocketProvider(p)}else if(p&&typeof net==='object'&&typeof net.connect==='function'){p=new this.providers.IpcProvider(p,net)}else if(p){throw new Error('Can\'t autodetect provider for "'+p+'"')}}
if(this.provider&&this.provider.connected)
this.clearSubscriptions();this.provider=p||null;if(this.provider&&this.provider.on){this.provider.on('data',function requestManagerNotification(result,deprecatedResult){result=result||deprecatedResult;if(result.method&&_this.subscriptions[result.params.subscription]&&_this.subscriptions[result.params.subscription].callback){_this.subscriptions[result.params.subscription].callback(null,result.params.result)}})}};RequestManager.prototype.send=function(data,callback){callback=callback||function(){};if(!this.provider){return callback(errors.InvalidProvider())}
var payload=Jsonrpc.toPayload(data.method,data.params);this.provider[this.provider.sendAsync?'sendAsync':'send'](payload,function(err,result){if(result&&result.id&&payload.id!==result.id)return callback(new Error('Wrong response id "'+result.id+'" (expected: "'+payload.id+'") in '+JSON.stringify(payload)));if(err){return callback(err)}
if(result&&result.error){return callback(errors.ErrorResponse(result))}
if(!Jsonrpc.isValidResponse(result)){return callback(errors.InvalidResponse(result))}
callback(null,result.result)})};RequestManager.prototype.sendBatch=function(data,callback){if(!this.provider){return callback(errors.InvalidProvider())}
var payload=Jsonrpc.toBatchPayload(data);this.provider[this.provider.sendAsync?'sendAsync':'send'](payload,function(err,results){if(err){return callback(err)}
if(!_.isArray(results)){return callback(errors.InvalidResponse(results))}
callback(null,results)})};RequestManager.prototype.addSubscription=function(id,name,type,callback){if(this.provider.on){this.subscriptions[id]={callback:callback,type:type,name:name}}else{throw new Error('The provider doesn\'t support subscriptions: '+this.provider.constructor.name)}};RequestManager.prototype.removeSubscription=function(id,callback){var _this=this;if(this.subscriptions[id]){this.send({method:this.subscriptions[id].type+'_unsubscribe',params:[id]},callback);delete _this.subscriptions[id]}};RequestManager.prototype.clearSubscriptions=function(keepIsSyncing){var _this=this;Object.keys(this.subscriptions).forEach(function(id){if(!keepIsSyncing||_this.subscriptions[id].name!=='syncing')
_this.removeSubscription(id)});if(this.provider.reset)
this.provider.reset()};module.exports={Manager:RequestManager,BatchManager:BatchManager}},{"./batch.js":361,"./givenProvider.js":362,"./jsonrpc.js":364,"underscore":352,"web3-core-helpers":358,"web3-providers-http":393,"web3-providers-ipc":394,"web3-providers-ws":395}],364:[function(require,module,exports){"use strict";var Jsonrpc={messageId:0};Jsonrpc.toPayload=function(method,params){if(!method){throw new Error('JSONRPC method should be specified for params: "'+JSON.stringify(params)+'"!')}
Jsonrpc.messageId++;return{jsonrpc:'2.0',id:Jsonrpc.messageId,method:method,params:params||[]}};Jsonrpc.isValidResponse=function(response){return Array.isArray(response)?response.every(validateSingleMessage):validateSingleMessage(response);function validateSingleMessage(message){return!!message&&!message.error&&message.jsonrpc==='2.0'&&(typeof message.id==='number'||typeof message.id==='string')&&message.result!==undefined}};Jsonrpc.toBatchPayload=function(messages){return messages.map(function(message){return Jsonrpc.toPayload(message.method,message.params)})};module.exports=Jsonrpc},{}],365:[function(require,module,exports){"use strict";var Subscription=require('./subscription.js');var Subscriptions=function Subscriptions(options){this.name=options.name;this.type=options.type;this.subscriptions=options.subscriptions||{};this.requestManager=null};Subscriptions.prototype.setRequestManager=function(rm){this.requestManager=rm};Subscriptions.prototype.attachToObject=function(obj){var func=this.buildCall();var name=this.name.split('.');if(name.length>1){obj[name[0]]=obj[name[0]]||{};obj[name[0]][name[1]]=func}else{obj[name[0]]=func}};Subscriptions.prototype.buildCall=function(){var _this=this;return function(){if(!_this.subscriptions[arguments[0]]){console.warn('Subscription '+JSON.stringify(arguments[0])+' doesn\'t exist. Subscribing anyway.')}
var subscription=new Subscription({subscription:_this.subscriptions[arguments[0]],requestManager:_this.requestManager,type:_this.type});return subscription.subscribe.apply(subscription,arguments)}};module.exports={subscriptions:Subscriptions,subscription:Subscription}},{"./subscription.js":366}],366:[function(require,module,exports){"use strict";var _=require('underscore');var errors=require('web3-core-helpers').errors;var EventEmitter=require('eventemitter3');function Subscription(options){EventEmitter.call(this);this.id=null;this.callback=_.identity;this.arguments=null;this._reconnectIntervalId=null;this.options={subscription:options.subscription,type:options.type,requestManager:options.requestManager}}
Subscription.prototype=Object.create(EventEmitter.prototype);Subscription.prototype.constructor=Subscription;Subscription.prototype._extractCallback=function(args){if(_.isFunction(args[args.length-1])){return args.pop()}};Subscription.prototype._validateArgs=function(args){var subscription=this.options.subscription;if(!subscription)
subscription={};if(!subscription.params)
subscription.params=0;if(args.length!==subscription.params){throw errors.InvalidNumberOfParams(args.length,subscription.params+1,args[0])}};Subscription.prototype._formatInput=function(args){var subscription=this.options.subscription;if(!subscription){return args}
if(!subscription.inputFormatter){return args}
var formattedArgs=subscription.inputFormatter.map(function(formatter,index){return formatter?formatter(args[index]):args[index]});return formattedArgs};Subscription.prototype._formatOutput=function(result){var subscription=this.options.subscription;return(subscription&&subscription.outputFormatter&&result)?subscription.outputFormatter(result):result};Subscription.prototype._toPayload=function(args){var params=[];this.callback=this._extractCallback(args)||_.identity;if(!this.subscriptionMethod){this.subscriptionMethod=args.shift();if(this.options.subscription.subscriptionName){this.subscriptionMethod=this.options.subscription.subscriptionName}}
if(!this.arguments){this.arguments=this._formatInput(args);this._validateArgs(this.arguments);args=[]}
params.push(this.subscriptionMethod);params=params.concat(this.arguments);if(args.length){throw new Error('Only a callback is allowed as parameter on an already instantiated subscription.')}
return{method:this.options.type+'_subscribe',params:params}};Subscription.prototype.unsubscribe=function(callback){this.options.requestManager.removeSubscription(this.id,callback);this.id=null;this.removeAllListeners();clearInterval(this._reconnectIntervalId)};Subscription.prototype.subscribe=function(){var _this=this;var args=Array.prototype.slice.call(arguments);var payload=this._toPayload(args);if(!payload){return this}
if(!this.options.requestManager.provider){var err1=new Error('No provider set.');this.callback(err1,null,this);this.emit('error',err1);return this}
if(!this.options.requestManager.provider.on){var err2=new Error('The current provider doesn\'t support subscriptions: '+this.options.requestManager.provider.constructor.name);this.callback(err2,null,this);this.emit('error',err2);return this}
if(this.id){this.unsubscribe()}
this.options.params=payload.params[1];if(payload.params[0]==='logs'&&_.isObject(payload.params[1])&&payload.params[1].hasOwnProperty('fromBlock')&&isFinite(payload.params[1].fromBlock)){this.options.requestManager.send({method:'eth_getLogs',params:[payload.params[1]]},function(err,logs){if(!err){logs.forEach(function(log){var output=_this._formatOutput(log);_this.callback(null,output,_this);_this.emit('data',output)})}else{_this.callback(err,null,_this);_this.emit('error',err)}})}
if(typeof payload.params[1]==='object')
delete payload.params[1].fromBlock;this.options.requestManager.send(payload,function(err,result){if(!err&&result){_this.id=result;_this.options.requestManager.addSubscription(_this.id,payload.params[0],_this.options.type,function(err,result){if(!err){if(!_.isArray(result)){result=[result]}
result.forEach(function(resultItem){var output=_this._formatOutput(resultItem);if(_.isFunction(_this.options.subscription.subscriptionHandler)){return _this.options.subscription.subscriptionHandler.call(_this,output)}else{_this.emit('data',output)}
_this.callback(null,output,_this)})}else{_this.options.requestManager.removeSubscription(_this.id);if(_this.options.requestManager.provider.once){_this._reconnectIntervalId=setInterval(function(){if(_this.options.requestManager.provider.reconnect){_this.options.requestManager.provider.reconnect()}},500);_this.options.requestManager.provider.once('connect',function(){clearInterval(_this._reconnectIntervalId);_this.subscribe(_this.callback)})}
_this.emit('error',err);_this.callback(err,null,_this)}})}else{_this.callback(err,null,_this);_this.emit('error',err)}});return this};module.exports=Subscription},{"eventemitter3":278,"underscore":352,"web3-core-helpers":358}],367:[function(require,module,exports){"use strict";var formatters=require('web3-core-helpers').formatters;var Method=require('web3-core-method');var utils=require('web3-utils');var extend=function(pckg){var ex=function(extension){var extendedObject;if(extension.property){if(!pckg[extension.property]){pckg[extension.property]={}}
extendedObject=pckg[extension.property]}else{extendedObject=pckg}
if(extension.methods){extension.methods.forEach(function(method){if(!(method instanceof Method)){method=new Method(method)}
method.attachToObject(extendedObject);method.setRequestManager(pckg._requestManager)})}
return pckg};ex.formatters=formatters;ex.utils=utils;ex.Method=Method;return ex};module.exports=extend},{"web3-core-helpers":358,"web3-core-method":359,"web3-utils":398}],368:[function(require,module,exports){"use strict";var requestManager=require('web3-core-requestmanager');var extend=require('./extend.js');module.exports={packageInit:function(pkg,args){args=Array.prototype.slice.call(args);if(!pkg){throw new Error('You need to instantiate using the "new" keyword.')}
Object.defineProperty(pkg,'currentProvider',{get:function(){return pkg._provider},set:function(value){return pkg.setProvider(value)},enumerable:!0,configurable:!0});if(args[0]&&args[0]._requestManager){pkg._requestManager=new requestManager.Manager(args[0].currentProvider)}else{pkg._requestManager=new requestManager.Manager();pkg._requestManager.setProvider(args[0],args[1])}
pkg.givenProvider=requestManager.Manager.givenProvider;pkg.providers=requestManager.Manager.providers;pkg._provider=pkg._requestManager.provider;if(!pkg.setProvider){pkg.setProvider=function(provider,net){pkg._requestManager.setProvider(provider,net);pkg._provider=pkg._requestManager.provider;return!0}}
pkg.BatchRequest=requestManager.BatchManager.bind(null,pkg._requestManager);pkg.extend=extend(pkg)},addProviders:function(pkg){pkg.givenProvider=requestManager.Manager.givenProvider;pkg.providers=requestManager.Manager.providers}}},{"./extend.js":367,"web3-core-requestmanager":363}],369:[function(require,module,exports){var _=require('underscore');var utils=require('web3-utils');var EthersAbi=require('ethers/utils/abi-coder').AbiCoder;var ethersAbiCoder=new EthersAbi(function(type,value){if(type.match(/^u?int/)&&!_.isArray(value)&&(!_.isObject(value)||value.constructor.name!=='BN')){return value.toString()}
return value});function Result(){}
var ABICoder=function(){};ABICoder.prototype.encodeFunctionSignature=function(functionName){if(_.isObject(functionName)){functionName=utils._jsonInterfaceMethodToString(functionName)}
return utils.sha3(functionName).slice(0,10)};ABICoder.prototype.encodeEventSignature=function(functionName){if(_.isObject(functionName)){functionName=utils._jsonInterfaceMethodToString(functionName)}
return utils.sha3(functionName)};ABICoder.prototype.encodeParameter=function(type,param){return this.encodeParameters([type],[param])};ABICoder.prototype.encodeParameters=function(types,params){return ethersAbiCoder.encode(this.mapTypes(types),params)};ABICoder.prototype.mapTypes=function(types){var self=this;var mappedTypes=[];types.forEach(function(type){if(self.isSimplifiedStructFormat(type)){var structName=Object.keys(type)[0];mappedTypes.push(Object.assign(self.mapStructNameAndType(structName),{components:self.mapStructToCoderFormat(type[structName])}));return}
mappedTypes.push(type)});return mappedTypes};ABICoder.prototype.isSimplifiedStructFormat=function(type){return typeof type==='object'&&typeof type.components==='undefined'&&typeof type.name==='undefined'};ABICoder.prototype.mapStructNameAndType=function(structName){var type='tuple';if(structName.indexOf('[]')>-1){type='tuple[]';structName=structName.slice(0,-2)}
return{type:type,name:structName}};ABICoder.prototype.mapStructToCoderFormat=function(struct){var self=this;var components=[];Object.keys(struct).forEach(function(key){if(typeof struct[key]==='object'){components.push(Object.assign(self.mapStructNameAndType(key),{components:self.mapStructToCoderFormat(struct[key])}));return}
components.push({name:key,type:struct[key]})});return components};ABICoder.prototype.encodeFunctionCall=function(jsonInterface,params){return this.encodeFunctionSignature(jsonInterface)+this.encodeParameters(jsonInterface.inputs,params).replace('0x','')};ABICoder.prototype.decodeParameter=function(type,bytes){return this.decodeParameters([type],bytes)[0]};ABICoder.prototype.decodeParameters=function(outputs,bytes){if(!bytes||bytes==='0x'||bytes==='0X'){throw new Error('Returned values aren\'t valid, did it run Out of Gas?')}
var res=ethersAbiCoder.decode(this.mapTypes(outputs),'0x'+bytes.replace(/0x/i,''));var returnValue=new Result();returnValue.__length__=0;outputs.forEach(function(output,i){var decodedValue=res[returnValue.__length__];decodedValue=(decodedValue==='0x')?null:decodedValue;returnValue[i]=decodedValue;if(_.isObject(output)&&output.name){returnValue[output.name]=decodedValue}
returnValue.__length__++});return returnValue};ABICoder.prototype.decodeLog=function(inputs,data,topics){var _this=this;topics=_.isArray(topics)?topics:[topics];data=data||'';var notIndexedInputs=[];var indexedParams=[];var topicCount=0;inputs.forEach(function(input,i){if(input.indexed){indexedParams[i]=(['bool','int','uint','address','fixed','ufixed'].find(function(staticType){return input.type.indexOf(staticType)!==-1}))?_this.decodeParameter(input.type,topics[topicCount]):topics[topicCount];topicCount++}else{notIndexedInputs[i]=input}});var nonIndexedData=data;var notIndexedParams=(nonIndexedData)?this.decodeParameters(notIndexedInputs,nonIndexedData):[];var returnValue=new Result();returnValue.__length__=0;inputs.forEach(function(res,i){returnValue[i]=(res.type==='string')?'':null;if(typeof notIndexedParams[i]!=='undefined'){returnValue[i]=notIndexedParams[i]}
if(typeof indexedParams[i]!=='undefined'){returnValue[i]=indexedParams[i]}
if(res.name){returnValue[res.name]=returnValue[i]}
returnValue.__length__++});return returnValue};var coder=new ABICoder();module.exports=coder},{"ethers/utils/abi-coder":266,"underscore":352,"web3-utils":398}],370:[function(require,module,exports){(function(Buffer){var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=!0;var _d=!1;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=!0){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=!0;_e=err}finally{try{if(!_n&&_i["return"])_i["return"]()}finally{if(_d)throw _e}}return _arr}return function(arr,i){if(Array.isArray(arr)){return arr}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i)}else{throw new TypeError("Invalid attempt to destructure non-iterable instance")}}}();var Bytes=require("./bytes");var Nat=require("./nat");var elliptic=require("elliptic");var rlp=require("./rlp");var secp256k1=new elliptic.ec("secp256k1");var _require=require("./hash"),keccak256=_require.keccak256,keccak256s=_require.keccak256s;var create=function create(entropy){var innerHex=keccak256(Bytes.concat(Bytes.random(32),entropy||Bytes.random(32)));var middleHex=Bytes.concat(Bytes.concat(Bytes.random(32),innerHex),Bytes.random(32));var outerHex=keccak256(middleHex);return fromPrivate(outerHex)};var toChecksum=function toChecksum(address){var addressHash=keccak256s(address.slice(2));var checksumAddress="0x";for(var i=0;i<40;i++){checksumAddress+=parseInt(addressHash[i+2],16)>7?address[i+2].toUpperCase():address[i+2]}return checksumAddress};var fromPrivate=function fromPrivate(privateKey){var buffer=new Buffer(privateKey.slice(2),"hex");var ecKey=secp256k1.keyFromPrivate(buffer);var publicKey="0x"+ecKey.getPublic(!1,'hex').slice(2);var publicHash=keccak256(publicKey);var address=toChecksum("0x"+publicHash.slice(-40));return{address:address,privateKey:privateKey}};var encodeSignature=function encodeSignature(_ref){var _ref2=_slicedToArray(_ref,3),v=_ref2[0],r=Bytes.pad(32,_ref2[1]),s=Bytes.pad(32,_ref2[2]);return Bytes.flatten([r,s,v])};var decodeSignature=function decodeSignature(hex){return[Bytes.slice(64,Bytes.length(hex),hex),Bytes.slice(0,32,hex),Bytes.slice(32,64,hex)]};var makeSigner=function makeSigner(addToV){return function(hash,privateKey){var signature=secp256k1.keyFromPrivate(new Buffer(privateKey.slice(2),"hex")).sign(new Buffer(hash.slice(2),"hex"),{canonical:!0});return encodeSignature([Nat.fromString(Bytes.fromNumber(addToV+signature.recoveryParam)),Bytes.pad(32,Bytes.fromNat("0x"+signature.r.toString(16))),Bytes.pad(32,Bytes.fromNat("0x"+signature.s.toString(16)))])}};var sign=makeSigner(27);var recover=function recover(hash,signature){var vals=decodeSignature(signature);var vrs={v:Bytes.toNumber(vals[0]),r:vals[1].slice(2),s:vals[2].slice(2)};var ecPublicKey=secp256k1.recoverPubKey(new Buffer(hash.slice(2),"hex"),vrs,vrs.v<2?vrs.v:1-vrs.v%2);var publicKey="0x"+ecPublicKey.encode("hex",!1).slice(2);var publicHash=keccak256(publicKey);var address=toChecksum("0x"+publicHash.slice(-40));return address};module.exports={create:create,toChecksum:toChecksum,fromPrivate:fromPrivate,sign:sign,makeSigner:makeSigner,recover:recover,encodeSignature:encodeSignature,decodeSignature:decodeSignature}}).call(this,require("buffer").Buffer)},{"./bytes":372,"./hash":373,"./nat":374,"./rlp":375,"buffer":48,"elliptic":244}],371:[function(require,module,exports){arguments[4][262][0].apply(exports,arguments)},{"dup":262}],372:[function(require,module,exports){arguments[4][263][0].apply(exports,arguments)},{"./array.js":371,"dup":263}],373:[function(require,module,exports){arguments[4][264][0].apply(exports,arguments)},{"dup":264}],374:[function(require,module,exports){var BN=require("bn.js");var Bytes=require("./bytes");var fromBN=function fromBN(bn){return"0x"+bn.toString("hex")};var toBN=function toBN(str){return new BN(str.slice(2),16)};var fromString=function fromString(str){var bn="0x"+(str.slice(0,2)==="0x"?new BN(str.slice(2),16):new BN(str,10)).toString("hex");return bn==="0x0"?"0x":bn};var toEther=function toEther(wei){return toNumber(div(wei,fromString("10000000000")))/100000000};var fromEther=function fromEther(eth){return mul(fromNumber(Math.floor(eth*100000000)),fromString("10000000000"))};var toString=function toString(a){return toBN(a).toString(10)};var fromNumber=function fromNumber(a){return typeof a==="string"?/^0x/.test(a)?a:"0x"+a:"0x"+new BN(a).toString("hex")};var toNumber=function toNumber(a){return toBN(a).toNumber()};var toUint256=function toUint256(a){return Bytes.pad(32,a)};var bin=function bin(method){return function(a,b){return fromBN(toBN(a)[method](toBN(b)))}};var add=bin("add");var mul=bin("mul");var div=bin("div");var sub=bin("sub");module.exports={toString:toString,fromString:fromString,toNumber:toNumber,fromNumber:fromNumber,toEther:toEther,fromEther:fromEther,toUint256:toUint256,add:add,mul:mul,div:div,sub:sub}},{"./bytes":372,"bn.js":195}],375:[function(require,module,exports){var encode=function encode(tree){var padEven=function padEven(str){return str.length%2===0?str:"0"+str};var uint=function uint(num){return padEven(num.toString(16))};var length=function length(len,add){return len<56?uint(add+len):uint(add+uint(len).length/2+55)+uint(len)};var dataTree=function dataTree(tree){if(typeof tree==="string"){var hex=tree.slice(2);var pre=hex.length!=2||hex>="80"?length(hex.length/2,128):"";return pre+hex}else{var _hex=tree.map(dataTree).join("");var _pre=length(_hex.length/2,192);return _pre+_hex}};return"0x"+dataTree(tree)};var decode=function decode(hex){var i=2;var parseTree=function parseTree(){if(i>=hex.length)throw "";var head=hex.slice(i,i+2);return head<"80"?(i+=2,"0x"+head):head<"c0"?parseHex():parseList()};var parseLength=function parseLength(){var len=parseInt(hex.slice(i,i+=2),16)%64;return len<56?len:parseInt(hex.slice(i,i+=(len-55)*2),16)};var parseHex=function parseHex(){var len=parseLength();return"0x"+hex.slice(i,i+=len*2)};var parseList=function parseList(){var lim=parseLength()*2+i;var list=[];while(i<lim){list.push(parseTree())}return list};try{return parseTree()}catch(e){return[]}};module.exports={encode:encode,decode:decode}},{}],376:[function(require,module,exports){(function(global){var rng;if(global.crypto&&crypto.getRandomValues){var _rnds8=new Uint8Array(16);rng=function whatwgRNG(){crypto.getRandomValues(_rnds8);return _rnds8}}
if(!rng){var _rnds=new Array(16);rng=function(){for(var i=0,r;i<16;i++){if((i&0x03)===0)r=Math.random()*0x100000000;_rnds[i]=r>>>((i&0x03)<<3)&0xff}
return _rnds}}
module.exports=rng}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],377:[function(require,module,exports){var _rng=require('./rng');var _byteToHex=[];var _hexToByte={};for(var i=0;i<256;i++){_byteToHex[i]=(i+0x100).toString(16).substr(1);_hexToByte[_byteToHex[i]]=i}
function parse(s,buf,offset){var i=(buf&&offset)||0,ii=0;buf=buf||[];s.toLowerCase().replace(/[0-9a-f]{2}/g,function(oct){if(ii<16){buf[i+ii++]=_hexToByte[oct]}});while(ii<16){buf[i+ii++]=0}
return buf}
function unparse(buf,offset){var i=offset||0,bth=_byteToHex;return bth[buf[i++]]+bth[buf[i++]]+bth[buf[i++]]+bth[buf[i++]]+'-'+bth[buf[i++]]+bth[buf[i++]]+'-'+bth[buf[i++]]+bth[buf[i++]]+'-'+bth[buf[i++]]+bth[buf[i++]]+'-'+bth[buf[i++]]+bth[buf[i++]]+bth[buf[i++]]+bth[buf[i++]]+bth[buf[i++]]+bth[buf[i++]]}
var _seedBytes=_rng();var _nodeId=[_seedBytes[0]|0x01,_seedBytes[1],_seedBytes[2],_seedBytes[3],_seedBytes[4],_seedBytes[5]];var _clockseq=(_seedBytes[6]<<8|_seedBytes[7])&0x3fff;var _lastMSecs=0,_lastNSecs=0;function v1(options,buf,offset){var i=buf&&offset||0;var b=buf||[];options=options||{};var clockseq=options.clockseq!==undefined?options.clockseq:_clockseq;var msecs=options.msecs!==undefined?options.msecs:new Date().getTime();var nsecs=options.nsecs!==undefined?options.nsecs:_lastNSecs+1;var dt=(msecs-_lastMSecs)+(nsecs-_lastNSecs)/10000;if(dt<0&&options.clockseq===undefined){clockseq=clockseq+1&0x3fff}
if((dt<0||msecs>_lastMSecs)&&options.nsecs===undefined){nsecs=0}
if(nsecs>=10000){throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec')}
_lastMSecs=msecs;_lastNSecs=nsecs;_clockseq=clockseq;msecs+=12219292800000;var tl=((msecs&0xfffffff)*10000+nsecs)%0x100000000;b[i++]=tl>>>24&0xff;b[i++]=tl>>>16&0xff;b[i++]=tl>>>8&0xff;b[i++]=tl&0xff;var tmh=(msecs/0x100000000*10000)&0xfffffff;b[i++]=tmh>>>8&0xff;b[i++]=tmh&0xff;b[i++]=tmh>>>24&0xf|0x10;b[i++]=tmh>>>16&0xff;b[i++]=clockseq>>>8|0x80;b[i++]=clockseq&0xff;var node=options.node||_nodeId;for(var n=0;n<6;n++){b[i+n]=node[n]}
return buf?buf:unparse(b)}
function v4(options,buf,offset){var i=buf&&offset||0;if(typeof(options)=='string'){buf=options=='binary'?new Array(16):null;options=null}
options=options||{};var rnds=options.random||(options.rng||_rng)();rnds[6]=(rnds[6]&0x0f)|0x40;rnds[8]=(rnds[8]&0x3f)|0x80;if(buf){for(var ii=0;ii<16;ii++){buf[i+ii]=rnds[ii]}}
return buf||unparse(rnds)}
var uuid=v4;uuid.v1=v1;uuid.v4=v4;uuid.parse=parse;uuid.unparse=unparse;module.exports=uuid},{"./rng":376}],378:[function(require,module,exports){(function(global,Buffer){"use strict";var _=require("underscore");var core=require('web3-core');var Method=require('web3-core-method');var Promise=require('any-promise');var Account=require("eth-lib/lib/account");var Hash=require("eth-lib/lib/hash");var RLP=require("eth-lib/lib/rlp");var Nat=require("eth-lib/lib/nat");var Bytes=require("eth-lib/lib/bytes");var cryp=(typeof global==='undefined')?require('crypto-browserify'):require('crypto');var scryptsy=require('scrypt.js');var uuid=require('uuid');var utils=require('web3-utils');var helpers=require('web3-core-helpers');var isNot=function(value){return(_.isUndefined(value)||_.isNull(value))};var trimLeadingZero=function(hex){while(hex&&hex.startsWith('0x0')){hex='0x'+hex.slice(3)}
return hex};var makeEven=function(hex){if(hex.length%2===1){hex=hex.replace('0x','0x0')}
return hex};var Accounts=function Accounts(){var _this=this;core.packageInit(this,arguments);delete this.BatchRequest;delete this.extend;var _ethereumCall=[new Method({name:'getId',call:'net_version',params:0,outputFormatter:utils.hexToNumber}),new Method({name:'getGasPrice',call:'eth_gasPrice',params:0}),new Method({name:'getTransactionCount',call:'eth_getTransactionCount',params:2,inputFormatter:[function(address){if(utils.isAddress(address)){return address}else{throw new Error('Address '+address+' is not a valid address to get the "transactionCount".')}},function(){return'latest'}]})];this._ethereumCall={};_.each(_ethereumCall,function(method){method.attachToObject(_this._ethereumCall);method.setRequestManager(_this._requestManager)});this.wallet=new Wallet(this)};Accounts.prototype._addAccountFunctions=function(account){var _this=this;account.signTransaction=function signTransaction(tx,callback){return _this.signTransaction(tx,account.privateKey,callback)};account.sign=function sign(data){return _this.sign(data,account.privateKey)};account.encrypt=function encrypt(password,options){return _this.encrypt(account.privateKey,password,options)};return account};Accounts.prototype.create=function create(entropy){return this._addAccountFunctions(Account.create(entropy||utils.randomHex(32)))};Accounts.prototype.privateKeyToAccount=function privateKeyToAccount(privateKey){return this._addAccountFunctions(Account.fromPrivate(privateKey))};Accounts.prototype.signTransaction=function signTransaction(tx,privateKey,callback){var _this=this,error=!1,result;callback=callback||function(){};if(!tx){error=new Error('No transaction object given!');callback(error);return Promise.reject(error)}
function signed(tx){if(!tx.gas&&!tx.gasLimit){error=new Error('"gas" is missing')}
if(tx.nonce<0||tx.gas<0||tx.gasPrice<0||tx.chainId<0){error=new Error('Gas, gasPrice, nonce or chainId is lower than 0')}
if(error){callback(error);return Promise.reject(error)}
try{tx=helpers.formatters.inputCallFormatter(tx);var transaction=tx;transaction.to=tx.to||'0x';transaction.data=tx.data||'0x';transaction.value=tx.value||'0x';transaction.chainId=utils.numberToHex(tx.chainId);var rlpEncoded=RLP.encode([Bytes.fromNat(transaction.nonce),Bytes.fromNat(transaction.gasPrice),Bytes.fromNat(transaction.gas),transaction.to.toLowerCase(),Bytes.fromNat(transaction.value),transaction.data,Bytes.fromNat(transaction.chainId||"0x1"),"0x","0x"]);var hash=Hash.keccak256(rlpEncoded);var signature=Account.makeSigner(Nat.toNumber(transaction.chainId||"0x1")*2+35)(Hash.keccak256(rlpEncoded),privateKey);var rawTx=RLP.decode(rlpEncoded).slice(0,6).concat(Account.decodeSignature(signature));rawTx[6]=makeEven(trimLeadingZero(rawTx[6]));rawTx[7]=makeEven(trimLeadingZero(rawTx[7]));rawTx[8]=makeEven(trimLeadingZero(rawTx[8]));var rawTransaction=RLP.encode(rawTx);var values=RLP.decode(rawTransaction);result={messageHash:hash,v:trimLeadingZero(values[6]),r:trimLeadingZero(values[7]),s:trimLeadingZero(values[8]),rawTransaction:rawTransaction}}catch(e){callback(e);return Promise.reject(e)}
callback(null,result);return result}
if(tx.nonce!==undefined&&tx.chainId!==undefined&&tx.gasPrice!==undefined){return Promise.resolve(signed(tx))}
return Promise.all([isNot(tx.chainId)?_this._ethereumCall.getId():tx.chainId,isNot(tx.gasPrice)?_this._ethereumCall.getGasPrice():tx.gasPrice,isNot(tx.nonce)?_this._ethereumCall.getTransactionCount(_this.privateKeyToAccount(privateKey).address):tx.nonce]).then(function(args){if(isNot(args[0])||isNot(args[1])||isNot(args[2])){throw new Error('One of the values "chainId", "gasPrice", or "nonce" couldn\'t be fetched: '+JSON.stringify(args))}
return signed(_.extend(tx,{chainId:args[0],gasPrice:args[1],nonce:args[2]}))})};Accounts.prototype.recoverTransaction=function recoverTransaction(rawTx){var values=RLP.decode(rawTx);var signature=Account.encodeSignature(values.slice(6,9));var recovery=Bytes.toNumber(values[6]);var extraData=recovery<35?[]:[Bytes.fromNumber((recovery-35)>>1),"0x","0x"];var signingData=values.slice(0,6).concat(extraData);var signingDataHex=RLP.encode(signingData);return Account.recover(Hash.keccak256(signingDataHex),signature)};Accounts.prototype.hashMessage=function hashMessage(data){var message=utils.isHexStrict(data)?utils.hexToBytes(data):data;var messageBuffer=Buffer.from(message);var preamble="\x19Ethereum Signed Message:\n"+message.length;var preambleBuffer=Buffer.from(preamble);var ethMessage=Buffer.concat([preambleBuffer,messageBuffer]);return Hash.keccak256s(ethMessage)};Accounts.prototype.sign=function sign(data,privateKey){var hash=this.hashMessage(data);var signature=Account.sign(hash,privateKey);var vrs=Account.decodeSignature(signature);return{message:data,messageHash:hash,v:vrs[0],r:vrs[1],s:vrs[2],signature:signature}};Accounts.prototype.recover=function recover(message,signature,preFixed){var args=[].slice.apply(arguments);if(_.isObject(message)){return this.recover(message.messageHash,Account.encodeSignature([message.v,message.r,message.s]),!0)}
if(!preFixed){message=this.hashMessage(message)}
if(args.length>=4){preFixed=args.slice(-1)[0];preFixed=_.isBoolean(preFixed)?!!preFixed:!1;return this.recover(message,Account.encodeSignature(args.slice(1,4)),preFixed)}
return Account.recover(message,signature)};Accounts.prototype.decrypt=function(v3Keystore,password,nonStrict){if(!_.isString(password)){throw new Error('No password given.')}
var json=(_.isObject(v3Keystore))?v3Keystore:JSON.parse(nonStrict?v3Keystore.toLowerCase():v3Keystore);if(json.version!==3){throw new Error('Not a valid V3 wallet')}
var derivedKey;var kdfparams;if(json.crypto.kdf==='scrypt'){kdfparams=json.crypto.kdfparams;derivedKey=scryptsy(new Buffer(password),new Buffer(kdfparams.salt,'hex'),kdfparams.n,kdfparams.r,kdfparams.p,kdfparams.dklen)}else if(json.crypto.kdf==='pbkdf2'){kdfparams=json.crypto.kdfparams;if(kdfparams.prf!=='hmac-sha256'){throw new Error('Unsupported parameters to PBKDF2')}
derivedKey=cryp.pbkdf2Sync(new Buffer(password),new Buffer(kdfparams.salt,'hex'),kdfparams.c,kdfparams.dklen,'sha256')}else{throw new Error('Unsupported key derivation scheme')}
var ciphertext=new Buffer(json.crypto.ciphertext,'hex');var mac=utils.sha3(Buffer.concat([derivedKey.slice(16,32),ciphertext])).replace('0x','');if(mac!==json.crypto.mac){throw new Error('Key derivation failed - possibly wrong password')}
var decipher=cryp.createDecipheriv(json.crypto.cipher,derivedKey.slice(0,16),new Buffer(json.crypto.cipherparams.iv,'hex'));var seed='0x'+Buffer.concat([decipher.update(ciphertext),decipher.final()]).toString('hex');return this.privateKeyToAccount(seed)};Accounts.prototype.encrypt=function(privateKey,password,options){var account=this.privateKeyToAccount(privateKey);options=options||{};var salt=options.salt||cryp.randomBytes(32);var iv=options.iv||cryp.randomBytes(16);var derivedKey;var kdf=options.kdf||'scrypt';var kdfparams={dklen:options.dklen||32,salt:salt.toString('hex')};if(kdf==='pbkdf2'){kdfparams.c=options.c||262144;kdfparams.prf='hmac-sha256';derivedKey=cryp.pbkdf2Sync(new Buffer(password),salt,kdfparams.c,kdfparams.dklen,'sha256')}else if(kdf==='scrypt'){kdfparams.n=options.n||8192;kdfparams.r=options.r||8;kdfparams.p=options.p||1;derivedKey=scryptsy(new Buffer(password),salt,kdfparams.n,kdfparams.r,kdfparams.p,kdfparams.dklen)}else{throw new Error('Unsupported kdf')}
var cipher=cryp.createCipheriv(options.cipher||'aes-128-ctr',derivedKey.slice(0,16),iv);if(!cipher){throw new Error('Unsupported cipher')}
var ciphertext=Buffer.concat([cipher.update(new Buffer(account.privateKey.replace('0x',''),'hex')),cipher.final()]);var mac=utils.sha3(Buffer.concat([derivedKey.slice(16,32),new Buffer(ciphertext,'hex')])).replace('0x','');return{version:3,id:uuid.v4({random:options.uuid||cryp.randomBytes(16)}),address:account.address.toLowerCase().replace('0x',''),crypto:{ciphertext:ciphertext.toString('hex'),cipherparams:{iv:iv.toString('hex')},cipher:options.cipher||'aes-128-ctr',kdf:kdf,kdfparams:kdfparams,mac:mac.toString('hex')}}};function Wallet(accounts){this._accounts=accounts;this.length=0;this.defaultKeyName="web3js_wallet"}
Wallet.prototype._findSafeIndex=function(pointer){pointer=pointer||0;if(_.has(this,pointer)){return this._findSafeIndex(pointer+1)}else{return pointer}};Wallet.prototype._currentIndexes=function(){var keys=Object.keys(this);var indexes=keys.map(function(key){return parseInt(key)}).filter(function(n){return(n<9e20)});return indexes};Wallet.prototype.create=function(numberOfAccounts,entropy){for(var i=0;i<numberOfAccounts;++i){this.add(this._accounts.create(entropy).privateKey)}
return this};Wallet.prototype.add=function(account){if(_.isString(account)){account=this._accounts.privateKeyToAccount(account)}
if(!this[account.address]){account=this._accounts.privateKeyToAccount(account.privateKey);account.index=this._findSafeIndex();this[account.index]=account;this[account.address]=account;this[account.address.toLowerCase()]=account;this.length++;return account}else{return this[account.address]}};Wallet.prototype.remove=function(addressOrIndex){var account=this[addressOrIndex];if(account&&account.address){this[account.address].privateKey=null;delete this[account.address];this[account.address.toLowerCase()].privateKey=null;delete this[account.address.toLowerCase()];this[account.index].privateKey=null;delete this[account.index];this.length--;return!0}else{return!1}};Wallet.prototype.clear=function(){var _this=this;var indexes=this._currentIndexes();indexes.forEach(function(index){_this.remove(index)});return this};Wallet.prototype.encrypt=function(password,options){var _this=this;var indexes=this._currentIndexes();var accounts=indexes.map(function(index){return _this[index].encrypt(password,options)});return accounts};Wallet.prototype.decrypt=function(encryptedWallet,password){var _this=this;encryptedWallet.forEach(function(keystore){var account=_this._accounts.decrypt(keystore,password);if(account){_this.add(account)}else{throw new Error('Couldn\'t decrypt accounts. Password wrong?')}});return this};Wallet.prototype.save=function(password,keyName){localStorage.setItem(keyName||this.defaultKeyName,JSON.stringify(this.encrypt(password)));return!0};Wallet.prototype.load=function(password,keyName){var keystore=localStorage.getItem(keyName||this.defaultKeyName);if(keystore){try{keystore=JSON.parse(keystore)}catch(e){}}
return this.decrypt(keystore||[],password)};if(typeof localStorage==='undefined'){delete Wallet.prototype.save;delete Wallet.prototype.load}
module.exports=Accounts}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{},require("buffer").Buffer)},{"any-promise":178,"buffer":48,"crypto":57,"crypto-browserify":232,"eth-lib/lib/account":370,"eth-lib/lib/bytes":372,"eth-lib/lib/hash":373,"eth-lib/lib/nat":374,"eth-lib/lib/rlp":375,"scrypt.js":335,"underscore":352,"uuid":377,"web3-core":368,"web3-core-helpers":358,"web3-core-method":359,"web3-utils":398}],379:[function(require,module,exports){"use strict";var _=require('underscore');var core=require('web3-core');var Method=require('web3-core-method');var utils=require('web3-utils');var Subscription=require('web3-core-subscriptions').subscription;var formatters=require('web3-core-helpers').formatters;var errors=require('web3-core-helpers').errors;var promiEvent=require('web3-core-promievent');var abi=require('web3-eth-abi');var Contract=function Contract(jsonInterface,address,options){var _this=this,args=Array.prototype.slice.call(arguments);if(!(this instanceof Contract)){throw new Error('Please use the "new" keyword to instantiate a web3.eth.contract() object!')}
core.packageInit(this,[this.constructor.currentProvider]);this.clearSubscriptions=this._requestManager.clearSubscriptions;if(!jsonInterface||!(Array.isArray(jsonInterface))){throw new Error('You must provide the json interface of the contract when instantiating a contract object.')}
this.options={};var lastArg=args[args.length-1];if(_.isObject(lastArg)&&!_.isArray(lastArg)){options=lastArg;this.options=_.extend(this.options,this._getOrSetDefaultOptions(options));if(_.isObject(address)){address=null}}
Object.defineProperty(this.options,'address',{set:function(value){if(value){_this._address=utils.toChecksumAddress(formatters.inputAddressFormatter(value))}},get:function(){return _this._address},enumerable:!0});Object.defineProperty(this.options,'jsonInterface',{set:function(value){_this.methods={};_this.events={};_this._jsonInterface=value.map(function(method){var func,funcName;method.constant=(method.stateMutability==="view"||method.stateMutability==="pure"||method.constant);method.payable=(method.stateMutability==="payable"||method.payable);if(method.name){funcName=utils._jsonInterfaceMethodToString(method)}
if(method.type==='function'){method.signature=abi.encodeFunctionSignature(funcName);func=_this._createTxObject.bind({method:method,parent:_this});if(!_this.methods[method.name]){_this.methods[method.name]=func}else{var cascadeFunc=_this._createTxObject.bind({method:method,parent:_this,nextMethod:_this.methods[method.name]});_this.methods[method.name]=cascadeFunc}
_this.methods[method.signature]=func;_this.methods[funcName]=func}else if(method.type==='event'){method.signature=abi.encodeEventSignature(funcName);var event=_this._on.bind(_this,method.signature);if(!_this.events[method.name]||_this.events[method.name].name==='bound ')
_this.events[method.name]=event;_this.events[method.signature]=event;_this.events[funcName]=event}
return method});_this.events.allEvents=_this._on.bind(_this,'allevents');return _this._jsonInterface},get:function(){return _this._jsonInterface},enumerable:!0});var defaultAccount=this.constructor.defaultAccount;var defaultBlock=this.constructor.defaultBlock||'latest';Object.defineProperty(this,'defaultAccount',{get:function(){return defaultAccount},set:function(val){if(val){defaultAccount=utils.toChecksumAddress(formatters.inputAddressFormatter(val))}
return val},enumerable:!0});Object.defineProperty(this,'defaultBlock',{get:function(){return defaultBlock},set:function(val){defaultBlock=val;return val},enumerable:!0});this.methods={};this.events={};this._address=null;this._jsonInterface=[];this.options.address=address;this.options.jsonInterface=jsonInterface};Contract.setProvider=function(provider,accounts){core.packageInit(this,[provider]);this._ethAccounts=accounts};Contract.prototype._getCallback=function getCallback(args){if(args&&_.isFunction(args[args.length-1])){return args.pop()}};Contract.prototype._checkListener=function(type,event){if(event===type){throw new Error('The event "'+type+'" is a reserved event name, you can\'t use it.')}};Contract.prototype._getOrSetDefaultOptions=function getOrSetDefaultOptions(options){var gasPrice=options.gasPrice?String(options.gasPrice):null;var from=options.from?utils.toChecksumAddress(formatters.inputAddressFormatter(options.from)):null;options.data=options.data||this.options.data;options.from=from||this.options.from;options.gasPrice=gasPrice||this.options.gasPrice;options.gas=options.gas||options.gasLimit||this.options.gas;delete options.gasLimit;return options};Contract.prototype._encodeEventABI=function(event,options){options=options||{};var filter=options.filter||{},result={};['fromBlock','toBlock'].filter(function(f){return options[f]!==undefined}).forEach(function(f){result[f]=formatters.inputBlockNumberFormatter(options[f])});if(_.isArray(options.topics)){result.topics=options.topics}else{result.topics=[];if(event&&!event.anonymous&&event.name!=='ALLEVENTS'){result.topics.push(event.signature)}
if(event.name!=='ALLEVENTS'){var indexedTopics=event.inputs.filter(function(i){return i.indexed===!0}).map(function(i){var value=filter[i.name];if(!value){return null}
if(_.isArray(value)){return value.map(function(v){return abi.encodeParameter(i.type,v)})}
return abi.encodeParameter(i.type,value)});result.topics=result.topics.concat(indexedTopics)}
if(!result.topics.length)
delete result.topics}
if(this.options.address){result.address=this.options.address.toLowerCase()}
return result};Contract.prototype._decodeEventABI=function(data){var event=this;data.data=data.data||'';data.topics=data.topics||[];var result=formatters.outputLogFormatter(data);if(event.name==='ALLEVENTS'){event=event.jsonInterface.find(function(intf){return(intf.signature===data.topics[0])})||{anonymous:!0}}
event.inputs=event.inputs||[];var argTopics=event.anonymous?data.topics:data.topics.slice(1);result.returnValues=abi.decodeLog(event.inputs,data.data,argTopics);delete result.returnValues.__length__;result.event=event.name;result.signature=(event.anonymous||!data.topics[0])?null:data.topics[0];result.raw={data:result.data,topics:result.topics};delete result.data;delete result.topics;return result};Contract.prototype._encodeMethodABI=function _encodeMethodABI(){var methodSignature=this._method.signature,args=this.arguments||[];var signature=!1,paramsABI=this._parent.options.jsonInterface.filter(function(json){return((methodSignature==='constructor'&&json.type===methodSignature)||((json.signature===methodSignature||json.signature===methodSignature.replace('0x','')||json.name===methodSignature)&&json.type==='function'))}).map(function(json){var inputLength=(_.isArray(json.inputs))?json.inputs.length:0;if(inputLength!==args.length){throw new Error('The number of arguments is not matching the methods required number. You need to pass '+inputLength+' arguments.')}
if(json.type==='function'){signature=json.signature}
return _.isArray(json.inputs)?json.inputs:[]}).map(function(inputs){return abi.encodeParameters(inputs,args).replace('0x','')})[0]||'';if(methodSignature==='constructor'){if(!this._deployData)
throw new Error('The contract has no contract data option set. This is necessary to append the constructor parameters.');return this._deployData+paramsABI}else{var returnValue=(signature)?signature+paramsABI:paramsABI;if(!returnValue){throw new Error('Couldn\'t find a matching contract method named "'+this._method.name+'".')}else{return returnValue}}};Contract.prototype._decodeMethodReturn=function(outputs,returnValues){if(!returnValues){return null}
returnValues=returnValues.length>=2?returnValues.slice(2):returnValues;var result=abi.decodeParameters(outputs,returnValues);if(result.__length__===1){return result[0]}else{delete result.__length__;return result}};Contract.prototype.deploy=function(options,callback){options=options||{};options.arguments=options.arguments||[];options=this._getOrSetDefaultOptions(options);if(!options.data){return utils._fireError(new Error('No "data" specified in neither the given options, nor the default options.'),null,null,callback)}
var constructor=_.find(this.options.jsonInterface,function(method){return(method.type==='constructor')})||{};constructor.signature='constructor';return this._createTxObject.apply({method:constructor,parent:this,deployData:options.data,_ethAccounts:this.constructor._ethAccounts},options.arguments)};Contract.prototype._generateEventOptions=function(){var args=Array.prototype.slice.call(arguments);var callback=this._getCallback(args);var options=(_.isObject(args[args.length-1]))?args.pop():{};var event=(_.isString(args[0]))?args[0]:'allevents';event=(event.toLowerCase()==='allevents')?{name:'ALLEVENTS',jsonInterface:this.options.jsonInterface}:this.options.jsonInterface.find(function(json){return(json.type==='event'&&(json.name===event||json.signature==='0x'+event.replace('0x','')))});if(!event){throw new Error('Event "'+event.name+'" doesn\'t exist in this contract.')}
if(!utils.isAddress(this.options.address)){throw new Error('This contract object doesn\'t have address set yet, please set an address first.')}
return{params:this._encodeEventABI(event,options),event:event,callback:callback}};Contract.prototype.clone=function(){return new this.constructor(this.options.jsonInterface,this.options.address,this.options)};Contract.prototype.once=function(event,options,callback){var args=Array.prototype.slice.call(arguments);callback=this._getCallback(args);if(!callback){throw new Error('Once requires a callback as the second parameter.')}
if(options)
delete options.fromBlock;this._on(event,options,function(err,res,sub){sub.unsubscribe();if(_.isFunction(callback)){callback(err,res,sub)}});return undefined};Contract.prototype._on=function(){var subOptions=this._generateEventOptions.apply(this,arguments);this._checkListener('newListener',subOptions.event.name,subOptions.callback);this._checkListener('removeListener',subOptions.event.name,subOptions.callback);var subscription=new Subscription({subscription:{params:1,inputFormatter:[formatters.inputLogFormatter],outputFormatter:this._decodeEventABI.bind(subOptions.event),subscriptionHandler:function(output){if(output.removed){this.emit('changed',output)}else{this.emit('data',output)}
if(_.isFunction(this.callback)){this.callback(null,output,this)}}},type:'eth',requestManager:this._requestManager});subscription.subscribe('logs',subOptions.params,subOptions.callback||function(){});return subscription};Contract.prototype.getPastEvents=function(){var subOptions=this._generateEventOptions.apply(this,arguments);var getPastLogs=new Method({name:'getPastLogs',call:'eth_getLogs',params:1,inputFormatter:[formatters.inputLogFormatter],outputFormatter:this._decodeEventABI.bind(subOptions.event)});getPastLogs.setRequestManager(this._requestManager);var call=getPastLogs.buildCall();getPastLogs=null;return call(subOptions.params,subOptions.callback)};Contract.prototype._createTxObject=function _createTxObject(){var args=Array.prototype.slice.call(arguments);var txObject={};if(this.method.type==='function'){txObject.call=this.parent._executeMethod.bind(txObject,'call');txObject.call.request=this.parent._executeMethod.bind(txObject,'call',!0)}
txObject.send=this.parent._executeMethod.bind(txObject,'send');txObject.send.request=this.parent._executeMethod.bind(txObject,'send',!0);txObject.encodeABI=this.parent._encodeMethodABI.bind(txObject);txObject.estimateGas=this.parent._executeMethod.bind(txObject,'estimate');if(args&&this.method.inputs&&args.length!==this.method.inputs.length){if(this.nextMethod){return this.nextMethod.apply(null,args)}
throw errors.InvalidNumberOfParams(args.length,this.method.inputs.length,this.method.name)}
txObject.arguments=args||[];txObject._method=this.method;txObject._parent=this.parent;txObject._ethAccounts=this.parent.constructor._ethAccounts||this._ethAccounts;if(this.deployData){txObject._deployData=this.deployData}
return txObject};Contract.prototype._processExecuteArguments=function _processExecuteArguments(args,defer){var processedArgs={};processedArgs.type=args.shift();processedArgs.callback=this._parent._getCallback(args);if(processedArgs.type==='call'&&args[args.length-1]!==!0&&(_.isString(args[args.length-1])||isFinite(args[args.length-1])))
processedArgs.defaultBlock=args.pop();processedArgs.options=(_.isObject(args[args.length-1]))?args.pop():{};processedArgs.generateRequest=(args[args.length-1]===!0)?args.pop():!1;processedArgs.options=this._parent._getOrSetDefaultOptions(processedArgs.options);processedArgs.options.data=this.encodeABI();if(!this._deployData&&!utils.isAddress(this._parent.options.address))
throw new Error('This contract object doesn\'t have address set yet, please set an address first.');if(!this._deployData)
processedArgs.options.to=this._parent.options.address;if(!processedArgs.options.data)
return utils._fireError(new Error('Couldn\'t find a matching contract method, or the number of parameters is wrong.'),defer.eventEmitter,defer.reject,processedArgs.callback);return processedArgs};Contract.prototype._executeMethod=function _executeMethod(){var _this=this,args=this._parent._processExecuteArguments.call(this,Array.prototype.slice.call(arguments),defer),defer=promiEvent((args.type!=='send')),ethAccounts=_this.constructor._ethAccounts||_this._ethAccounts;if(args.generateRequest){var payload={params:[formatters.inputCallFormatter.call(this._parent,args.options)],callback:args.callback};if(args.type==='call'){payload.params.push(formatters.inputDefaultBlockNumberFormatter.call(this._parent,args.defaultBlock));payload.method='eth_call';payload.format=this._parent._decodeMethodReturn.bind(null,this._method.outputs)}else{payload.method='eth_sendTransaction'}
return payload}else{switch(args.type){case 'estimate':var estimateGas=(new Method({name:'estimateGas',call:'eth_estimateGas',params:1,inputFormatter:[formatters.inputCallFormatter],outputFormatter:utils.hexToNumber,requestManager:_this._parent._requestManager,accounts:ethAccounts,defaultAccount:_this._parent.defaultAccount,defaultBlock:_this._parent.defaultBlock})).createFunction();return estimateGas(args.options,args.callback);case 'call':var call=(new Method({name:'call',call:'eth_call',params:2,inputFormatter:[formatters.inputCallFormatter,formatters.inputDefaultBlockNumberFormatter],outputFormatter:function(result){return _this._parent._decodeMethodReturn(_this._method.outputs,result)},requestManager:_this._parent._requestManager,accounts:ethAccounts,defaultAccount:_this._parent.defaultAccount,defaultBlock:_this._parent.defaultBlock})).createFunction();return call(args.options,args.defaultBlock,args.callback);case 'send':if(!utils.isAddress(args.options.from)){return utils._fireError(new Error('No "from" address specified in neither the given options, nor the default options.'),defer.eventEmitter,defer.reject,args.callback)}
if(_.isBoolean(this._method.payable)&&!this._method.payable&&args.options.value&&args.options.value>0){return utils._fireError(new Error('Can not send value to non-payable contract method or constructor'),defer.eventEmitter,defer.reject,args.callback)}
var extraFormatters={receiptFormatter:function(receipt){if(_.isArray(receipt.logs)){var events=_.map(receipt.logs,function(log){return _this._parent._decodeEventABI.call({name:'ALLEVENTS',jsonInterface:_this._parent.options.jsonInterface},log)});receipt.events={};var count=0;events.forEach(function(ev){if(ev.event){if(receipt.events[ev.event]){if(Array.isArray(receipt.events[ev.event])){receipt.events[ev.event].push(ev)}else{receipt.events[ev.event]=[receipt.events[ev.event],ev]}}else{receipt.events[ev.event]=ev}}else{receipt.events[count]=ev;count++}});delete receipt.logs}
return receipt},contractDeployFormatter:function(receipt){var newContract=_this._parent.clone();newContract.options.address=receipt.contractAddress;return newContract}};var sendTransaction=(new Method({name:'sendTransaction',call:'eth_sendTransaction',params:1,inputFormatter:[formatters.inputTransactionFormatter],requestManager:_this._parent._requestManager,accounts:_this.constructor._ethAccounts||_this._ethAccounts,defaultAccount:_this._parent.defaultAccount,defaultBlock:_this._parent.defaultBlock,extraFormatters:extraFormatters})).createFunction();return sendTransaction(args.options,args.callback)}}};module.exports=Contract},{"underscore":352,"web3-core":368,"web3-core-helpers":358,"web3-core-method":359,"web3-core-promievent":360,"web3-core-subscriptions":365,"web3-eth-abi":369,"web3-utils":398}],380:[function(require,module,exports){"use strict";var config=require('./config');var Registry=require('./contracts/Registry');var ResolverMethodHandler=require('./lib/ResolverMethodHandler');function ENS(eth){this.eth=eth}
Object.defineProperty(ENS.prototype,'registry',{get:function(){return new Registry(this)},enumerable:!0});Object.defineProperty(ENS.prototype,'resolverMethodHandler',{get:function(){return new ResolverMethodHandler(this.registry)},enumerable:!0});ENS.prototype.resolver=function(name){return this.registry.resolver(name)};ENS.prototype.getAddress=function(name,callback){return this.resolverMethodHandler.method(name,'addr',[]).call(callback)};ENS.prototype.setAddress=function(name,address,sendOptions,callback){return this.resolverMethodHandler.method(name,'setAddr',[address]).send(sendOptions,callback)};ENS.prototype.getPubkey=function(name,callback){return this.resolverMethodHandler.method(name,'pubkey',[],callback).call(callback)};ENS.prototype.setPubkey=function(name,x,y,sendOptions,callback){return this.resolverMethodHandler.method(name,'setPubkey',[x,y]).send(sendOptions,callback)};ENS.prototype.getContent=function(name,callback){return this.resolverMethodHandler.method(name,'content',[]).call(callback)};ENS.prototype.setContent=function(name,hash,sendOptions,callback){return this.resolverMethodHandler.method(name,'setContent',[hash]).send(sendOptions,callback)};ENS.prototype.getMultihash=function(name,callback){return this.resolverMethodHandler.method(name,'multihash',[]).call(callback)};ENS.prototype.setMultihash=function(name,hash,sendOptions,callback){return this.resolverMethodHandler.method(name,'multihash',[hash]).send(sendOptions,callback)};ENS.prototype.checkNetwork=function(){var self=this;return self.eth.getBlock('latest').then(function(block){var headAge=new Date()/1000-block.timestamp;if(headAge>3600){throw new Error("Network not synced;last block was "+headAge+" seconds ago")}
return self.eth.net.getNetworkType()}).then(function(networkType){var addr=config.addresses[networkType];if(typeof addr==='undefined'){throw new Error("ENS is not supported on network "+networkType)}
return addr})};module.exports=ENS},{"./config":381,"./contracts/Registry":382,"./lib/ResolverMethodHandler":384}],381:[function(require,module,exports){"use strict";var config={addresses:{main:"0x314159265dD8dbb310642f98f50C066173C1259b",ropsten:"0x112234455c3a32fd11230c42e7bccd4a84e02010",rinkeby:"0xe7410170f87102df0055eb195163a03b7f2bff4a"},};module.exports=config},{}],382:[function(require,module,exports){"use strict";var _=require('underscore');var Contract=require('web3-eth-contract');var namehash=require('eth-ens-namehash');var PromiEvent=require('web3-core-promievent');var REGISTRY_ABI=require('../ressources/ABI/Registry');var RESOLVER_ABI=require('../ressources/ABI/Resolver');function Registry(ens){var self=this;this.ens=ens;this.contract=ens.checkNetwork().then(function(address){var contract=new Contract(REGISTRY_ABI,address);contract.setProvider(self.ens.eth.currentProvider);return contract})}
Registry.prototype.owner=function(name,callback){var promiEvent=new PromiEvent(!0);this.contract.then(function(contract){contract.methods.owner(namehash.hash(name)).call().then(function(receipt){promiEvent.resolve(receipt);if(_.isFunction(callback)){callback(receipt)}}).catch(function(error){promiEvent.reject(error);if(_.isFunction(callback)){callback(error)}})});return promiEvent.eventEmitter};Registry.prototype.resolver=function(name){var self=this;return this.contract.then(function(contract){return contract.methods.resolver(namehash.hash(name)).call()}).then(function(address){var contract=new Contract(RESOLVER_ABI,address);contract.setProvider(self.ens.eth.currentProvider);return contract})};module.exports=Registry},{"../ressources/ABI/Registry":385,"../ressources/ABI/Resolver":386,"eth-ens-namehash":260,"underscore":352,"web3-core-promievent":360,"web3-eth-contract":379}],383:[function(require,module,exports){"use strict";var ENS=require('./ENS');module.exports=ENS},{"./ENS":380}],384:[function(require,module,exports){"use strict";var PromiEvent=require('web3-core-promievent');var namehash=require('eth-ens-namehash');var _=require('underscore');function ResolverMethodHandler(registry){this.registry=registry}
ResolverMethodHandler.prototype.method=function(ensName,methodName,methodArguments,callback){return{call:this.call.bind({ensName:ensName,methodName:methodName,methodArguments:methodArguments,callback:callback,parent:this}),send:this.send.bind({ensName:ensName,methodName:methodName,methodArguments:methodArguments,callback:callback,parent:this})}};ResolverMethodHandler.prototype.call=function(callback){var self=this;var promiEvent=new PromiEvent();var preparedArguments=this.parent.prepareArguments(this.ensName,this.methodArguments);this.parent.registry.resolver(this.ensName).then(function(resolver){self.parent.handleCall(promiEvent,resolver.methods[self.methodName],preparedArguments,callback)}).catch(function(error){promiEvent.reject(error)});return promiEvent.eventEmitter};ResolverMethodHandler.prototype.send=function(sendOptions,callback){var self=this;var promiEvent=new PromiEvent();var preparedArguments=this.parent.prepareArguments(this.ensName,this.methodArguments);this.parent.registry.resolver(this.ensName).then(function(resolver){self.parent.handleSend(promiEvent,resolver.methods[self.methodName],preparedArguments,sendOptions,callback)}).catch(function(error){promiEvent.reject(error)});return promiEvent.eventEmitter};ResolverMethodHandler.prototype.handleCall=function(promiEvent,method,preparedArguments,callback){method.apply(this,preparedArguments).call().then(function(receipt){promiEvent.resolve(receipt);if(_.isFunction(callback)){callback(receipt)}}).catch(function(error){promiEvent.reject(error);if(_.isFunction(callback)){callback(error)}});return promiEvent};ResolverMethodHandler.prototype.handleSend=function(promiEvent,method,preparedArguments,sendOptions,callback){method.apply(this,preparedArguments).send(sendOptions).on('transactionHash',function(hash){promiEvent.eventEmitter.emit('transactionHash',hash)}).on('confirmation',function(confirmationNumber,receipt){promiEvent.eventEmitter.emit('confirmation',confirmationNumber,receipt)}).on('receipt',function(receipt){promiEvent.eventEmitter.emit('receipt',receipt);promiEvent.resolve(receipt);if(_.isFunction(callback)){callback(receipt)}}).on('error',function(error){promiEvent.eventEmitter.emit('error',error);promiEvent.reject(error);if(_.isFunction(callback)){callback(error)}});return promiEvent};ResolverMethodHandler.prototype.prepareArguments=function(name,methodArguments){var node=namehash.hash(name);if(methodArguments.length>0){methodArguments.unshift(node);return methodArguments}
return[node]};module.exports=ResolverMethodHandler},{"eth-ens-namehash":260,"underscore":352,"web3-core-promievent":360}],385:[function(require,module,exports){"use strict";var REGISTRY=[{"constant":!0,"inputs":[{"name":"node","type":"bytes32"}],"name":"resolver","outputs":[{"name":"","type":"address"}],"payable":!1,"type":"function"},{"constant":!0,"inputs":[{"name":"node","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"label","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setSubnodeOwner","outputs":[],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"ttl","type":"uint64"}],"name":"setTTL","outputs":[],"payable":!1,"type":"function"},{"constant":!0,"inputs":[{"name":"node","type":"bytes32"}],"name":"ttl","outputs":[{"name":"","type":"uint64"}],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"resolver","type":"address"}],"name":"setResolver","outputs":[],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setOwner","outputs":[],"payable":!1,"type":"function"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!1,"name":"owner","type":"address"}],"name":"Transfer","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!0,"name":"label","type":"bytes32"},{"indexed":!1,"name":"owner","type":"address"}],"name":"NewOwner","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!1,"name":"resolver","type":"address"}],"name":"NewResolver","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!1,"name":"ttl","type":"uint64"}],"name":"NewTTL","type":"event"}];module.exports=REGISTRY},{}],386:[function(require,module,exports){"use strict";var RESOLVER=[{"constant":!0,"inputs":[{"name":"interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":!1,"type":"function"},{"constant":!0,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentTypes","type":"uint256"}],"name":"ABI","outputs":[{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"hash","type":"bytes"}],"name":"setMultihash","outputs":[],"payable":!1,"stateMutability":"nonpayable","type":"function"},{"constant":!0,"inputs":[{"name":"node","type":"bytes32"}],"name":"multihash","outputs":[{"name":"","type":"bytes"}],"payable":!1,"stateMutability":"view","type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"name":"setPubkey","outputs":[],"payable":!1,"type":"function"},{"constant":!0,"inputs":[{"name":"node","type":"bytes32"}],"name":"content","outputs":[{"name":"ret","type":"bytes32"}],"payable":!1,"type":"function"},{"constant":!0,"inputs":[{"name":"node","type":"bytes32"}],"name":"addr","outputs":[{"name":"ret","type":"address"}],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"name":"setABI","outputs":[],"payable":!1,"type":"function"},{"constant":!0,"inputs":[{"name":"node","type":"bytes32"}],"name":"name","outputs":[{"name":"ret","type":"string"}],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"name","type":"string"}],"name":"setName","outputs":[],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"hash","type":"bytes32"}],"name":"setContent","outputs":[],"payable":!1,"type":"function"},{"constant":!0,"inputs":[{"name":"node","type":"bytes32"}],"name":"pubkey","outputs":[{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"payable":!1,"type":"function"},{"constant":!1,"inputs":[{"name":"node","type":"bytes32"},{"name":"addr","type":"address"}],"name":"setAddr","outputs":[],"payable":!1,"type":"function"},{"inputs":[{"name":"ensAddr","type":"address"}],"payable":!1,"type":"constructor"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!1,"name":"a","type":"address"}],"name":"AddrChanged","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!1,"name":"hash","type":"bytes32"}],"name":"ContentChanged","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!1,"name":"name","type":"string"}],"name":"NameChanged","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!0,"name":"contentType","type":"uint256"}],"name":"ABIChanged","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"name":"node","type":"bytes32"},{"indexed":!1,"name":"x","type":"bytes32"},{"indexed":!1,"name":"y","type":"bytes32"}],"name":"PubkeyChanged","type":"event"}];module.exports=RESOLVER},{}],387:[function(require,module,exports){arguments[4][277][0].apply(exports,arguments)},{"dup":277}],388:[function(require,module,exports){"use strict";var utils=require('web3-utils');var BigNumber=require('bn.js');var leftPad=function(string,bytes){var result=string;while(result.length<bytes*2){result='0'+result}
return result};var iso13616Prepare=function(iban){var A='A'.charCodeAt(0);var Z='Z'.charCodeAt(0);iban=iban.toUpperCase();iban=iban.substr(4)+iban.substr(0,4);return iban.split('').map(function(n){var code=n.charCodeAt(0);if(code>=A&&code<=Z){return code-A+10}else{return n}}).join('')};var mod9710=function(iban){var remainder=iban,block;while(remainder.length>2){block=remainder.slice(0,9);remainder=parseInt(block,10)%97+remainder.slice(block.length)}
return parseInt(remainder,10)%97};var Iban=function Iban(iban){this._iban=iban};Iban.toAddress=function(ib){ib=new Iban(ib);if(!ib.isDirect()){throw new Error('IBAN is indirect and can\'t be converted')}
return ib.toAddress()};Iban.toIban=function(address){return Iban.fromAddress(address).toString()};Iban.fromAddress=function(address){if(!utils.isAddress(address)){throw new Error('Provided address is not a valid address: '+address)}
address=address.replace('0x','').replace('0X','');var asBn=new BigNumber(address,16);var base36=asBn.toString(36);var padded=leftPad(base36,15);return Iban.fromBban(padded.toUpperCase())};Iban.fromBban=function(bban){var countryCode='XE';var remainder=mod9710(iso13616Prepare(countryCode+'00'+bban));var checkDigit=('0'+(98-remainder)).slice(-2);return new Iban(countryCode+checkDigit+bban)};Iban.createIndirect=function(options){return Iban.fromBban('ETH'+options.institution+options.identifier)};Iban.isValid=function(iban){var i=new Iban(iban);return i.isValid()};Iban.prototype.isValid=function(){return/^XE[0-9]{2}(ETH[0-9A-Z]{13}|[0-9A-Z]{30,31})$/.test(this._iban)&&mod9710(iso13616Prepare(this._iban))===1};Iban.prototype.isDirect=function(){return this._iban.length===34||this._iban.length===35};Iban.prototype.isIndirect=function(){return this._iban.length===20};Iban.prototype.checksum=function(){return this._iban.substr(2,2)};Iban.prototype.institution=function(){return this.isIndirect()?this._iban.substr(7,4):''};Iban.prototype.client=function(){return this.isIndirect()?this._iban.substr(11):''};Iban.prototype.toAddress=function(){if(this.isDirect()){var base36=this._iban.substr(4);var asBn=new BigNumber(base36,36);return utils.toChecksumAddress(asBn.toString(16,20))}
return''};Iban.prototype.toString=function(){return this._iban};module.exports=Iban},{"bn.js":387,"web3-utils":398}],389:[function(require,module,exports){"use strict";var core=require('web3-core');var Method=require('web3-core-method');var utils=require('web3-utils');var Net=require('web3-net');var formatters=require('web3-core-helpers').formatters;var Personal=function Personal(){var _this=this;core.packageInit(this,arguments);this.net=new Net(this.currentProvider);var defaultAccount=null;var defaultBlock='latest';Object.defineProperty(this,'defaultAccount',{get:function(){return defaultAccount},set:function(val){if(val){defaultAccount=utils.toChecksumAddress(formatters.inputAddressFormatter(val))}
methods.forEach(function(method){method.defaultAccount=defaultAccount});return val},enumerable:!0});Object.defineProperty(this,'defaultBlock',{get:function(){return defaultBlock},set:function(val){defaultBlock=val;methods.forEach(function(method){method.defaultBlock=defaultBlock});return val},enumerable:!0});var methods=[new Method({name:'getAccounts',call:'personal_listAccounts',params:0,outputFormatter:utils.toChecksumAddress}),new Method({name:'newAccount',call:'personal_newAccount',params:1,inputFormatter:[null],outputFormatter:utils.toChecksumAddress}),new Method({name:'unlockAccount',call:'personal_unlockAccount',params:3,inputFormatter:[formatters.inputAddressFormatter,null,null]}),new Method({name:'lockAccount',call:'personal_lockAccount',params:1,inputFormatter:[formatters.inputAddressFormatter]}),new Method({name:'importRawKey',call:'personal_importRawKey',params:2}),new Method({name:'sendTransaction',call:'personal_sendTransaction',params:2,inputFormatter:[formatters.inputTransactionFormatter,null]}),new Method({name:'signTransaction',call:'personal_signTransaction',params:2,inputFormatter:[formatters.inputTransactionFormatter,null]}),new Method({name:'sign',call:'personal_sign',params:3,inputFormatter:[formatters.inputSignFormatter,formatters.inputAddressFormatter,null]}),new Method({name:'ecRecover',call:'personal_ecRecover',params:2,inputFormatter:[formatters.inputSignFormatter,null]})];methods.forEach(function(method){method.attachToObject(_this);method.setRequestManager(_this._requestManager);method.defaultBlock=_this.defaultBlock;method.defaultAccount=_this.defaultAccount})};core.addProviders(Personal);module.exports=Personal},{"web3-core":368,"web3-core-helpers":358,"web3-core-method":359,"web3-net":392,"web3-utils":398}],390:[function(require,module,exports){"use strict";var _=require('underscore');var getNetworkType=function(callback){var _this=this,id;return this.net.getId().then(function(givenId){id=givenId;return _this.getBlock(0)}).then(function(genesis){var returnValue='private';if(genesis.hash==='0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'&&id===1){returnValue='main'}
if(genesis.hash==='0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303'&&id===2){returnValue='morden'}
if(genesis.hash==='0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d'&&id===3){returnValue='ropsten'}
if(genesis.hash==='0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177'&&id===4){returnValue='rinkeby'}
if(genesis.hash==='0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9'&&id===42){returnValue='kovan'}
if(_.isFunction(callback)){callback(null,returnValue)}
return returnValue}).catch(function(err){if(_.isFunction(callback)){callback(err)}else{throw err}})};module.exports=getNetworkType},{"underscore":352}],391:[function(require,module,exports){"use strict";var _=require('underscore');var core=require('web3-core');var helpers=require('web3-core-helpers');var Subscriptions=require('web3-core-subscriptions').subscriptions;var Method=require('web3-core-method');var utils=require('web3-utils');var Net=require('web3-net');var ENS=require('web3-eth-ens');var Personal=require('web3-eth-personal');var BaseContract=require('web3-eth-contract');var Iban=require('web3-eth-iban');var Accounts=require('web3-eth-accounts');var abi=require('web3-eth-abi');var getNetworkType=require('./getNetworkType.js');var formatter=helpers.formatters;var blockCall=function(args){return(_.isString(args[0])&&args[0].indexOf('0x')===0)?"eth_getBlockByHash":"eth_getBlockByNumber"};var transactionFromBlockCall=function(args){return(_.isString(args[0])&&args[0].indexOf('0x')===0)?'eth_getTransactionByBlockHashAndIndex':'eth_getTransactionByBlockNumberAndIndex'};var uncleCall=function(args){return(_.isString(args[0])&&args[0].indexOf('0x')===0)?'eth_getUncleByBlockHashAndIndex':'eth_getUncleByBlockNumberAndIndex'};var getBlockTransactionCountCall=function(args){return(_.isString(args[0])&&args[0].indexOf('0x')===0)?'eth_getBlockTransactionCountByHash':'eth_getBlockTransactionCountByNumber'};var uncleCountCall=function(args){return(_.isString(args[0])&&args[0].indexOf('0x')===0)?'eth_getUncleCountByBlockHash':'eth_getUncleCountByBlockNumber'};var Eth=function Eth(){var _this=this;core.packageInit(this,arguments);var setProvider=this.setProvider;this.setProvider=function(){setProvider.apply(_this,arguments);_this.net.setProvider.apply(_this,arguments);_this.personal.setProvider.apply(_this,arguments);_this.accounts.setProvider.apply(_this,arguments);_this.Contract.setProvider(_this.currentProvider,_this.accounts)};var defaultAccount=null;var defaultBlock='latest';Object.defineProperty(this,'defaultAccount',{get:function(){return defaultAccount},set:function(val){if(val){defaultAccount=utils.toChecksumAddress(formatter.inputAddressFormatter(val))}
_this.Contract.defaultAccount=defaultAccount;_this.personal.defaultAccount=defaultAccount;methods.forEach(function(method){method.defaultAccount=defaultAccount});return val},enumerable:!0});Object.defineProperty(this,'defaultBlock',{get:function(){return defaultBlock},set:function(val){defaultBlock=val;_this.Contract.defaultBlock=defaultBlock;_this.personal.defaultBlock=defaultBlock;methods.forEach(function(method){method.defaultBlock=defaultBlock});return val},enumerable:!0});this.clearSubscriptions=_this._requestManager.clearSubscriptions;this.net=new Net(this.currentProvider);this.net.getNetworkType=getNetworkType.bind(this);this.accounts=new Accounts(this.currentProvider);this.personal=new Personal(this.currentProvider);this.personal.defaultAccount=this.defaultAccount;var self=this;var Contract=function Contract(){BaseContract.apply(this,arguments);var _this=this;var setProvider=self.setProvider;self.setProvider=function(){setProvider.apply(self,arguments);core.packageInit(_this,[self.currentProvider])}};Contract.setProvider=function(){BaseContract.setProvider.apply(this,arguments)};Contract.prototype=Object.create(BaseContract.prototype);Contract.prototype.constructor=Contract;this.Contract=Contract;this.Contract.defaultAccount=this.defaultAccount;this.Contract.defaultBlock=this.defaultBlock;this.Contract.setProvider(this.currentProvider,this.accounts);this.Iban=Iban;this.abi=abi;this.ens=new ENS(this);var methods=[new Method({name:'getNodeInfo',call:'web3_clientVersion'}),new Method({name:'getProtocolVersion',call:'eth_protocolVersion',params:0}),new Method({name:'getCoinbase',call:'eth_coinbase',params:0}),new Method({name:'isMining',call:'eth_mining',params:0}),new Method({name:'getHashrate',call:'eth_hashrate',params:0,outputFormatter:utils.hexToNumber}),new Method({name:'isSyncing',call:'eth_syncing',params:0,outputFormatter:formatter.outputSyncingFormatter}),new Method({name:'getGasPrice',call:'eth_gasPrice',params:0,outputFormatter:formatter.outputBigNumberFormatter}),new Method({name:'getAccounts',call:'eth_accounts',params:0,outputFormatter:utils.toChecksumAddress}),new Method({name:'getBlockNumber',call:'eth_blockNumber',params:0,outputFormatter:utils.hexToNumber}),new Method({name:'getBalance',call:'eth_getBalance',params:2,inputFormatter:[formatter.inputAddressFormatter,formatter.inputDefaultBlockNumberFormatter],outputFormatter:formatter.outputBigNumberFormatter}),new Method({name:'getStorageAt',call:'eth_getStorageAt',params:3,inputFormatter:[formatter.inputAddressFormatter,utils.numberToHex,formatter.inputDefaultBlockNumberFormatter]}),new Method({name:'getCode',call:'eth_getCode',params:2,inputFormatter:[formatter.inputAddressFormatter,formatter.inputDefaultBlockNumberFormatter]}),new Method({name:'getBlock',call:blockCall,params:2,inputFormatter:[formatter.inputBlockNumberFormatter,function(val){return!!val}],outputFormatter:formatter.outputBlockFormatter}),new Method({name:'getUncle',call:uncleCall,params:2,inputFormatter:[formatter.inputBlockNumberFormatter,utils.numberToHex],outputFormatter:formatter.outputBlockFormatter,}),new Method({name:'getBlockTransactionCount',call:getBlockTransactionCountCall,params:1,inputFormatter:[formatter.inputBlockNumberFormatter],outputFormatter:utils.hexToNumber}),new Method({name:'getBlockUncleCount',call:uncleCountCall,params:1,inputFormatter:[formatter.inputBlockNumberFormatter],outputFormatter:utils.hexToNumber}),new Method({name:'getTransaction',call:'eth_getTransactionByHash',params:1,inputFormatter:[null],outputFormatter:formatter.outputTransactionFormatter}),new Method({name:'getTransactionFromBlock',call:transactionFromBlockCall,params:2,inputFormatter:[formatter.inputBlockNumberFormatter,utils.numberToHex],outputFormatter:formatter.outputTransactionFormatter}),new Method({name:'getTransactionReceipt',call:'eth_getTransactionReceipt',params:1,inputFormatter:[null],outputFormatter:formatter.outputTransactionReceiptFormatter}),new Method({name:'getTransactionCount',call:'eth_getTransactionCount',params:2,inputFormatter:[formatter.inputAddressFormatter,formatter.inputDefaultBlockNumberFormatter],outputFormatter:utils.hexToNumber}),new Method({name:'sendSignedTransaction',call:'eth_sendRawTransaction',params:1,inputFormatter:[null]}),new Method({name:'signTransaction',call:'eth_signTransaction',params:1,inputFormatter:[formatter.inputTransactionFormatter]}),new Method({name:'sendTransaction',call:'eth_sendTransaction',params:1,inputFormatter:[formatter.inputTransactionFormatter]}),new Method({name:'sign',call:'eth_sign',params:2,inputFormatter:[formatter.inputSignFormatter,formatter.inputAddressFormatter],transformPayload:function(payload){payload.params.reverse();return payload}}),new Method({name:'call',call:'eth_call',params:2,inputFormatter:[formatter.inputCallFormatter,formatter.inputDefaultBlockNumberFormatter]}),new Method({name:'estimateGas',call:'eth_estimateGas',params:1,inputFormatter:[formatter.inputCallFormatter],outputFormatter:utils.hexToNumber}),new Method({name:'submitWork',call:'eth_submitWork',params:3}),new Method({name:'getWork',call:'eth_getWork',params:0}),new Method({name:'getPastLogs',call:'eth_getLogs',params:1,inputFormatter:[formatter.inputLogFormatter],outputFormatter:formatter.outputLogFormatter}),new Subscriptions({name:'subscribe',type:'eth',subscriptions:{'newBlockHeaders':{subscriptionName:'newHeads',params:0,outputFormatter:formatter.outputBlockFormatter},'pendingTransactions':{subscriptionName:'newPendingTransactions',params:0},'logs':{params:1,inputFormatter:[formatter.inputLogFormatter],outputFormatter:formatter.outputLogFormatter,subscriptionHandler:function(output){if(output.removed){this.emit('changed',output)}else{this.emit('data',output)}
if(_.isFunction(this.callback)){this.callback(null,output,this)}}},'syncing':{params:0,outputFormatter:formatter.outputSyncingFormatter,subscriptionHandler:function(output){var _this=this;if(this._isSyncing!==!0){this._isSyncing=!0;this.emit('changed',_this._isSyncing);if(_.isFunction(this.callback)){this.callback(null,_this._isSyncing,this)}
setTimeout(function(){_this.emit('data',output);if(_.isFunction(_this.callback)){_this.callback(null,output,_this)}},0)}else{this.emit('data',output);if(_.isFunction(_this.callback)){this.callback(null,output,this)}
clearTimeout(this._isSyncingTimeout);this._isSyncingTimeout=setTimeout(function(){if(output.currentBlock>output.highestBlock-200){_this._isSyncing=!1;_this.emit('changed',_this._isSyncing);if(_.isFunction(_this.callback)){_this.callback(null,_this._isSyncing,_this)}}},500)}}}}})];methods.forEach(function(method){method.attachToObject(_this);method.setRequestManager(_this._requestManager,_this.accounts);method.defaultBlock=_this.defaultBlock;method.defaultAccount=_this.defaultAccount})};core.addProviders(Eth);module.exports=Eth},{"./getNetworkType.js":390,"underscore":352,"web3-core":368,"web3-core-helpers":358,"web3-core-method":359,"web3-core-subscriptions":365,"web3-eth-abi":369,"web3-eth-accounts":378,"web3-eth-contract":379,"web3-eth-ens":383,"web3-eth-iban":388,"web3-eth-personal":389,"web3-net":392,"web3-utils":398}],392:[function(require,module,exports){"use strict";var core=require('web3-core');var Method=require('web3-core-method');var utils=require('web3-utils');var Net=function(){var _this=this;core.packageInit(this,arguments);[new Method({name:'getId',call:'net_version',params:0,outputFormatter:utils.hexToNumber}),new Method({name:'isListening',call:'net_listening',params:0}),new Method({name:'getPeerCount',call:'net_peerCount',params:0,outputFormatter:utils.hexToNumber})].forEach(function(method){method.attachToObject(_this);method.setRequestManager(_this._requestManager)})};core.addProviders(Net);module.exports=Net},{"web3-core":368,"web3-core-method":359,"web3-utils":398}],393:[function(require,module,exports){var errors=require('web3-core-helpers').errors;var XHR2=require('xhr2-cookies').XMLHttpRequest
var http=require('http');var https=require('https');var HttpProvider=function HttpProvider(host,options){options=options||{};this.host=host||'http://localhost:8545';if(this.host.substring(0,5)==="https"){this.httpsAgent=new https.Agent({keepAlive:!0})}else{this.httpAgent=new http.Agent({keepAlive:!0})}
this.timeout=options.timeout||0;this.headers=options.headers;this.connected=!1};HttpProvider.prototype._prepareRequest=function(){var request=new XHR2();request.nodejsSet({httpsAgent:this.httpsAgent,httpAgent:this.httpAgent});request.open('POST',this.host,!0);request.setRequestHeader('Content-Type','application/json');request.timeout=this.timeout&&this.timeout!==1?this.timeout:0;request.withCredentials=!0;if(this.headers){this.headers.forEach(function(header){request.setRequestHeader(header.name,header.value)})}
return request};HttpProvider.prototype.send=function(payload,callback){var _this=this;var request=this._prepareRequest();request.onreadystatechange=function(){if(request.readyState===4&&request.timeout!==1){var result=request.responseText;var error=null;try{result=JSON.parse(result)}catch(e){error=errors.InvalidResponse(request.responseText)}
_this.connected=!0;callback(error,result)}};request.ontimeout=function(){_this.connected=!1;callback(errors.ConnectionTimeout(this.timeout))};try{request.send(JSON.stringify(payload))}catch(error){this.connected=!1;callback(errors.InvalidConnection(this.host))}};HttpProvider.prototype.disconnect=function(){};module.exports=HttpProvider},{"http":158,"https":100,"web3-core-helpers":358,"xhr2-cookies":413}],394:[function(require,module,exports){"use strict";var _=require('underscore');var errors=require('web3-core-helpers').errors;var oboe=require('oboe');var IpcProvider=function IpcProvider(path,net){var _this=this;this.responseCallbacks={};this.notificationCallbacks=[];this.path=path;this.connected=!1;this.connection=net.connect({path:this.path});this.addDefaultEvents();var callback=function(result){var id=null;if(_.isArray(result)){result.forEach(function(load){if(_this.responseCallbacks[load.id])
id=load.id})}else{id=result.id}
if(!id&&result.method.indexOf('_subscription')!==-1){_this.notificationCallbacks.forEach(function(callback){if(_.isFunction(callback))
callback(result)})}else if(_this.responseCallbacks[id]){_this.responseCallbacks[id](null,result);delete _this.responseCallbacks[id]}};if(net.constructor.name==='Socket'){oboe(this.connection).done(callback)}else{this.connection.on('data',function(data){_this._parseResponse(data.toString()).forEach(callback)})}};IpcProvider.prototype.addDefaultEvents=function(){var _this=this;this.connection.on('connect',function(){_this.connected=!0});this.connection.on('close',function(){_this.connected=!1});this.connection.on('error',function(){_this._timeout()});this.connection.on('end',function(){_this._timeout()});this.connection.on('timeout',function(){_this._timeout()})};IpcProvider.prototype._parseResponse=function(data){var _this=this,returnValues=[];var dechunkedData=data.replace(/\}[\n\r]?\{/g,'}|--|{').replace(/\}\][\n\r]?\[\{/g,'}]|--|[{').replace(/\}[\n\r]?\[\{/g,'}|--|[{').replace(/\}\][\n\r]?\{/g,'}]|--|{').split('|--|');dechunkedData.forEach(function(data){if(_this.lastChunk)
data=_this.lastChunk+data;var result=null;try{result=JSON.parse(data)}catch(e){_this.lastChunk=data;clearTimeout(_this.lastChunkTimeout);_this.lastChunkTimeout=setTimeout(function(){_this._timeout();throw errors.InvalidResponse(data)},1000*15);return}
clearTimeout(_this.lastChunkTimeout);_this.lastChunk=null;if(result)
returnValues.push(result)});return returnValues};IpcProvider.prototype._addResponseCallback=function(payload,callback){var id=payload.id||payload[0].id;var method=payload.method||payload[0].method;this.responseCallbacks[id]=callback;this.responseCallbacks[id].method=method};IpcProvider.prototype._timeout=function(){for(var key in this.responseCallbacks){if(this.responseCallbacks.hasOwnProperty(key)){this.responseCallbacks[key](errors.InvalidConnection('on IPC'));delete this.responseCallbacks[key]}}};IpcProvider.prototype.reconnect=function(){this.connection.connect({path:this.path})};IpcProvider.prototype.send=function(payload,callback){if(!this.connection.writable)
this.connection.connect({path:this.path});this.connection.write(JSON.stringify(payload));this._addResponseCallback(payload,callback)};IpcProvider.prototype.on=function(type,callback){if(typeof callback!=='function')
throw new Error('The second parameter callback must be a function.');switch(type){case 'data':this.notificationCallbacks.push(callback);break;default:this.connection.on(type,callback);break}};IpcProvider.prototype.once=function(type,callback){if(typeof callback!=='function')
throw new Error('The second parameter callback must be a function.');this.connection.once(type,callback)};IpcProvider.prototype.removeListener=function(type,callback){var _this=this;switch(type){case 'data':this.notificationCallbacks.forEach(function(cb,index){if(cb===callback)
_this.notificationCallbacks.splice(index,1)});break;default:this.connection.removeListener(type,callback);break}};IpcProvider.prototype.removeAllListeners=function(type){switch(type){case 'data':this.notificationCallbacks=[];break;default:this.connection.removeAllListeners(type);break}};IpcProvider.prototype.reset=function(){this._timeout();this.notificationCallbacks=[];this.connection.removeAllListeners('error');this.connection.removeAllListeners('end');this.connection.removeAllListeners('timeout');this.addDefaultEvents()};module.exports=IpcProvider},{"oboe":309,"underscore":352,"web3-core-helpers":358}],395:[function(require,module,exports){(function(Buffer){"use strict";var _=require('underscore');var errors=require('web3-core-helpers').errors;var Ws=null;var _btoa=null;var parseURL=null;if(typeof window!=='undefined'&&typeof window.WebSocket!=='undefined'){Ws=function(url,protocols){return new window.WebSocket(url,protocols)};_btoa=btoa;parseURL=function(url){return new url(url)}}else{Ws=require('websocket').w3cwebsocket;_btoa=function(str){return Buffer(str).toString('base64')};var url=require('url');if(url.URL){var newURL=url.URL;parseURL=function(url){return new newurl(url)}}
else{parseURL=require('url').parse}}
var WebsocketProvider=function WebsocketProvider(url,options){var _this=this;this.responseCallbacks={};this.notificationCallbacks=[];options=options||{};this._customTimeout=options.timeout;var parsedURL=parseurl(url);var headers=options.headers||{};var protocol=options.protocol||undefined;if(parsedURL.username&&parsedURL.password){headers.authorization='Basic '+_btoa(parsedURL.username+':'+parsedURL.password)}
var clientConfig=options.clientConfig||undefined;if(parsedURL.auth){headers.authorization='Basic '+_btoa(parsedURL.auth)}
this.connection=new Ws(url,protocol,undefined,headers,undefined,clientConfig);this.addDefaultEvents();this.connection.onmessage=function(e){var data=(typeof e.data==='string')?e.data:'';_this._parseResponse(data).forEach(function(result){var id=null;if(_.isArray(result)){result.forEach(function(load){if(_this.responseCallbacks[load.id])
id=load.id})}else{id=result.id}
if(!id&&result&&result.method&&result.method.indexOf('_subscription')!==-1){_this.notificationCallbacks.forEach(function(callback){if(_.isFunction(callback))
callback(result)})}else if(_this.responseCallbacks[id]){_this.responseCallbacks[id](null,result);delete _this.responseCallbacks[id]}})};Object.defineProperty(this,'connected',{get:function(){return this.connection&&this.connection.readyState===this.connection.OPEN},enumerable:!0,})};WebsocketProvider.prototype.addDefaultEvents=function(){var _this=this;this.connection.onerror=function(){_this._timeout()};this.connection.onclose=function(){_this._timeout();_this.reset()}};WebsocketProvider.prototype._parseResponse=function(data){var _this=this,returnValues=[];var dechunkedData=data.replace(/\}[\n\r]?\{/g,'}|--|{').replace(/\}\][\n\r]?\[\{/g,'}]|--|[{').replace(/\}[\n\r]?\[\{/g,'}|--|[{').replace(/\}\][\n\r]?\{/g,'}]|--|{').split('|--|');dechunkedData.forEach(function(data){if(_this.lastChunk)
data=_this.lastChunk+data;var result=null;try{result=JSON.parse(data)}catch(e){_this.lastChunk=data;clearTimeout(_this.lastChunkTimeout);_this.lastChunkTimeout=setTimeout(function(){_this._timeout();throw errors.InvalidResponse(data)},1000*15);return}
clearTimeout(_this.lastChunkTimeout);_this.lastChunk=null;if(result)
returnValues.push(result)});return returnValues};WebsocketProvider.prototype._addResponseCallback=function(payload,callback){var id=payload.id||payload[0].id;var method=payload.method||payload[0].method;this.responseCallbacks[id]=callback;this.responseCallbacks[id].method=method;var _this=this;if(this._customTimeout){setTimeout(function(){if(_this.responseCallbacks[id]){_this.responseCallbacks[id](errors.ConnectionTimeout(_this._customTimeout));delete _this.responseCallbacks[id]}},this._customTimeout)}};WebsocketProvider.prototype._timeout=function(){for(var key in this.responseCallbacks){if(this.responseCallbacks.hasOwnProperty(key)){this.responseCallbacks[key](errors.InvalidConnection('on WS'));delete this.responseCallbacks[key]}}};WebsocketProvider.prototype.send=function(payload,callback){var _this=this;if(this.connection.readyState===this.connection.CONNECTING){setTimeout(function(){_this.send(payload,callback)},10);return}
if(this.connection.readyState!==this.connection.OPEN){console.error('connection not open on send()');if(typeof this.connection.onerror==='function'){this.connection.onerror(new Error('connection not open'))}else{console.error('no error callback')}
callback(new Error('connection not open'));return}
this.connection.send(JSON.stringify(payload));this._addResponseCallback(payload,callback)};WebsocketProvider.prototype.on=function(type,callback){if(typeof callback!=='function')
throw new Error('The second parameter callback must be a function.');switch(type){case 'data':this.notificationCallbacks.push(callback);break;case 'connect':this.connection.onopen=callback;break;case 'end':this.connection.onclose=callback;break;case 'error':this.connection.onerror=callback;break}};WebsocketProvider.prototype.removeListener=function(type,callback){var _this=this;switch(type){case 'data':this.notificationCallbacks.forEach(function(cb,index){if(cb===callback)
_this.notificationCallbacks.splice(index,1)});break}};WebsocketProvider.prototype.removeAllListeners=function(type){switch(type){case 'data':this.notificationCallbacks=[];break;case 'connect':this.connection.onopen=null;break;case 'end':this.connection.onclose=null;break;case 'error':this.connection.onerror=null;break;default:break}};WebsocketProvider.prototype.reset=function(){this._timeout();this.notificationCallbacks=[];this.addDefaultEvents()};WebsocketProvider.prototype.disconnect=function(){if(this.connection){this.connection.close()}};module.exports=WebsocketProvider}).call(this,require("buffer").Buffer)},{"buffer":48,"underscore":352,"url":165,"web3-core-helpers":358,"websocket":403}],396:[function(require,module,exports){"use strict";var core=require('web3-core');var Subscriptions=require('web3-core-subscriptions').subscriptions;var Method=require('web3-core-method');var Net=require('web3-net');var Shh=function Shh(){var _this=this;core.packageInit(this,arguments);var setProvider=this.setProvider;this.setProvider=function(){setProvider.apply(_this,arguments);_this.net.setProvider.apply(_this,arguments)};this.clearSubscriptions=_this._requestManager.clearSubscriptions;this.net=new Net(this.currentProvider);[new Subscriptions({name:'subscribe',type:'shh',subscriptions:{'messages':{params:1}}}),new Method({name:'getVersion',call:'shh_version',params:0}),new Method({name:'getInfo',call:'shh_info',params:0}),new Method({name:'setMaxMessageSize',call:'shh_setMaxMessageSize',params:1}),new Method({name:'setMinPoW',call:'shh_setMinPoW',params:1}),new Method({name:'markTrustedPeer',call:'shh_markTrustedPeer',params:1}),new Method({name:'newKeyPair',call:'shh_newKeyPair',params:0}),new Method({name:'addPrivateKey',call:'shh_addPrivateKey',params:1}),new Method({name:'deleteKeyPair',call:'shh_deleteKeyPair',params:1}),new Method({name:'hasKeyPair',call:'shh_hasKeyPair',params:1}),new Method({name:'getPublicKey',call:'shh_getPublicKey',params:1}),new Method({name:'getPrivateKey',call:'shh_getPrivateKey',params:1}),new Method({name:'newSymKey',call:'shh_newSymKey',params:0}),new Method({name:'addSymKey',call:'shh_addSymKey',params:1}),new Method({name:'generateSymKeyFromPassword',call:'shh_generateSymKeyFromPassword',params:1}),new Method({name:'hasSymKey',call:'shh_hasSymKey',params:1}),new Method({name:'getSymKey',call:'shh_getSymKey',params:1}),new Method({name:'deleteSymKey',call:'shh_deleteSymKey',params:1}),new Method({name:'newMessageFilter',call:'shh_newMessageFilter',params:1}),new Method({name:'getFilterMessages',call:'shh_getFilterMessages',params:1}),new Method({name:'deleteMessageFilter',call:'shh_deleteMessageFilter',params:1}),new Method({name:'post',call:'shh_post',params:1,inputFormatter:[null]}),new Method({name:'unsubscribe',call:'shh_unsubscribe',params:1})].forEach(function(method){method.attachToObject(_this);method.setRequestManager(_this._requestManager)})};core.addProviders(Shh);module.exports=Shh},{"web3-core":368,"web3-core-method":359,"web3-core-subscriptions":365,"web3-net":392}],397:[function(require,module,exports){arguments[4][277][0].apply(exports,arguments)},{"dup":277}],398:[function(require,module,exports){var _=require('underscore');var ethjsUnit=require('ethjs-unit');var utils=require('./utils.js');var soliditySha3=require('./soliditySha3.js');var randomHex=require('randomhex');var _fireError=function(error,emitter,reject,callback){if(_.isObject(error)&&!(error instanceof Error)&&error.data){if(_.isObject(error.data)||_.isArray(error.data)){error.data=JSON.stringify(error.data,null,2)}
error=error.message+"\n"+error.data}
if(_.isString(error)){error=new Error(error)}
if(_.isFunction(callback)){callback(error)}
if(_.isFunction(reject)){if(emitter&&(_.isFunction(emitter.listeners)&&emitter.listeners('error').length)||_.isFunction(callback)){emitter.catch(function(){})}
setTimeout(function(){reject(error)},1)}
if(emitter&&_.isFunction(emitter.emit)){setTimeout(function(){emitter.emit('error',error);emitter.removeAllListeners()},1)}
return emitter};var _jsonInterfaceMethodToString=function(json){if(_.isObject(json)&&json.name&&json.name.indexOf('(')!==-1){return json.name}
return json.name+'('+_flattenTypes(!1,json.inputs).join(',')+')'};var _flattenTypes=function(includeTuple,puts)
{var types=[];puts.forEach(function(param){if(typeof param.components==='object'){if(param.type.substring(0,5)!=='tuple'){throw new Error('components found but type is not tuple; report on GitHub')}
var suffix='';var arrayBracket=param.type.indexOf('[');if(arrayBracket>=0){suffix=param.type.substring(arrayBracket)}
var result=_flattenTypes(includeTuple,param.components);if(_.isArray(result)&&includeTuple){types.push('tuple('+result.join(',')+')'+suffix)}
else if(!includeTuple){types.push('('+result.join(',')+')'+suffix)}
else{types.push('('+result+')')}}else{types.push(param.type)}});return types};var hexToAscii=function(hex){if(!utils.isHexStrict(hex))throw new Error('The parameter must be a valid HEX string.');var str="";var i=0,l=hex.length;if(hex.substring(0,2)==='0x'){i=2}for(;i<l;i+=2){var code=parseInt(hex.substr(i,2),16);str+=String.fromCharCode(code)}return str};var asciiToHex=function(str){if(!str)return"0x00";var hex="";for(var i=0;i<str.length;i++){var code=str.charCodeAt(i);var n=code.toString(16);hex+=n.length<2?'0'+n:n}return"0x"+hex};var getUnitValue=function(unit){unit=unit?unit.toLowerCase():'ether';if(!ethjsUnit.unitMap[unit]){throw new Error('This unit "'+unit+'" doesn\'t exist, please use the one of the following units'+JSON.stringify(ethjsUnit.unitMap,null,2))}return unit};var fromWei=function(number,unit){unit=getUnitValue(unit);if(!utils.isBN(number)&&!_.isString(number)){throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.')}return utils.isBN(number)?ethjsUnit.fromWei(number,unit):ethjsUnit.fromWei(number,unit).toString(10)};var toWei=function(number,unit){unit=getUnitValue(unit);if(!utils.isBN(number)&&!_.isString(number)){throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.')}return utils.isBN(number)?ethjsUnit.toWei(number,unit):ethjsUnit.toWei(number,unit).toString(10)};var toChecksumAddress=function(address){if(typeof address==='undefined')return'';if(!/^(0x)?[0-9a-f]{40}$/i.test(address))throw new Error('Given address "'+address+'" is not a valid Ethereum address.');address=address.toLowerCase().replace(/^0x/i,'');var addressHash=utils.sha3(address).replace(/^0x/i,'');var checksumAddress='0x';for(var i=0;i<address.length;i++){}else if(/^(0x|0X)?[0-9a-f]{40}$/.test(address)||/^(0x|0X)?[0-9A-F]{40}$/.test(address)){return!0}else{return checkAddressChecksum(address)}};var checkAddressChecksum=function(address){address=address.replace(/^0x/i,'');var addressHash=sha3(address.toLowerCase()).replace(/^0x/i,'');for(var i=0;i<40;i++){if((parseInt(addressHash[i],16)>7&&address[i].toUpperCase()!==address[i])||(parseInt(addressHash[i],16)<=7&&address[i].toLowerCase()!==address[i])){return!1}}
return!0};var leftPad=function(string,chars,sign){var hasPrefix=/^0x/i.test(string)||typeof string==='number';string=string.toString(16).replace(/^0x/i,'');var padding=(chars-string.length+1>=0)?chars-string.length+1:0;return(hasPrefix?'0x':'')+new Array(padding).join(sign?sign:"0")+string};var rightPad=function(string,chars,sign){var hasPrefix=/^0x/i.test(string)||typeof string==='number';string=string.toString(16).replace(/^0x/i,'');var padding=(chars-string.length+1>=0)?chars-string.length+1:0;return(hasPrefix?'0x':'')+string+(new Array(padding).join(sign?sign:"0"))};var utf8ToHex=function(str){str=utf8.encode(str);var hex="";str=str.replace(/^(?:\u0000)*/,'');str=str.split("").reverse().join("");str=str.replace(/^(?:\u0000)*/,'');str=str.split("").reverse().join("");for(var i=0;i<str.length;i++){var code=str.charCodeAt(i);var n=code.toString(16);hex+=n.length<2?'0'+n:n}
return"0x"+hex};var hexToUtf8=function(hex){if(!isHexStrict(hex))throw new Error('The parameter "'+hex+'" must be a valid HEX string.');var str="";var code=0;hex=hex.replace(/^0x/i,'');status=200}else{status=(xhr.status===1223?204:xhr.status)}
var response=failureResponse
var err=null
if(status!==0){response={body:getBody(),statusCode:status,method:method,headers:{},url:uri,rawRequest:xhr}
if(xhr.getAllResponseHeaders){response.headers=parseHeaders(xhr.getAllResponseHeaders())}}else{err=new Error("Internal XMLHttpRequest Error")}
return callback(err,response,response.body)}
var xhr=options.xhr||null
if(!xhr){if(options.cors||options.useXDR){xhr=new createXHR.XDomainRequest()}else{xhr=new createXHR.XMLHttpRequest()}}
var key
var aborted
var uri=xhr.url=options.uri||options.url
var method=xhr.method=options.method||"GET"
var body=options.body||options.data
var headers=xhr.headers=options.headers||{}
var sync=!!options.sync
var isJson=!1
var timeoutTimer
var failureResponse={body:undefined,headers:{},statusCode:0,method:method,url:uri,rawRequest:xhr}
if("json" in options&&options.json!==!1){isJson=!0
headers.accept||headers.Accept||(headers.Accept="application/json")
body=JSON.stringify(options.json===!0?body:options.json)}}
xhr.onreadystatechange=readystatechange
xhr.onload=loadFunc
xhr.onerror=errorFunc
xhr.onprogress=function(){}
xhr.onabort=function(){aborted=!0}
xhr.ontimeout=errorFunc
xhr.open(method,uri,!sync,options.username,options.password)
if(!sync){xhr.withCredentials=!!options.withCredentials}
for(var name in defaultHeaders){if(!headersCase[name.toLowerCase()]){headers[name]=defaultHeaders[name]}}
headers.Host=host;if(!((ssl&&port===443)||port===80)){headers.Host+=":"+url.port}
if(settings.user){if(typeof settings.password==="undefined"){settings.password=""}
var authBuf=new Buffer(settings.user+":"+settings.password);headers.Authorization="Basic "+authBuf.toString("base64")}
if(settings.method==="GET"||settings.method==="HEAD"){data=null}else if(data){headers["Content-Length"]=Buffer.isBuffer(data)?data.length:Buffer.byteLength(data);if(!headers["Content-Type"]){headers["Content-Type"]="text/plain;charset=UTF-8"}}else if(settings.method==="POST"){host=url.hostname;var newOptions={hostname:url.hostname,port:url.port,path:url.path,method:response.statusCode===303?"GET":settings.method,headers:headers,withCredentials:self.withCredentials};request=doRequest(newOptions,responseHandler).on("error",errorHandler);request.end();return}
response.setEncoding("utf8");setState(self.HEADERS_RECEIVED);self.status=response.statusCode;response.on("data",function(chunk){if(sendFlag){setState(self.LOADING)}});response.on("end",function(){if(sendFlag){setState(self.DONE);sendFlag=!1}});response.on("error",function(error){self.handleError(error)})};var errorHandler=function errorHandler(error){self.handleError(error)};request=doRequest(options,responseHandler).on("error",errorHandler);if(data){request.write(data)}
request.end();self.dispatchEvent("loadstart")}else{var contentFile=".node-xmlhttprequest-content-"+process.pid;var syncFile=".node-xmlhttprequest-sync-"+process.pid;fs.writeFileSync(syncFile,"","utf8");var execString="var http = require('http'), https = require('https'), fs = require('fs');"+"var doRequest = http"+(ssl?"s":"")+".request;"+"var options = "+JSON.stringify(options)+";"+"var responseText = '';"+"var req = doRequest(options, function(response) {"+"response.setEncoding('utf8');"+"response.on('data', function(chunk) {"+"  responseText += chunk;"+"});"+"response.on('end', function() {"+"fs.writeFileSync('"+contentFile+"', JSON.stringify({err: null, data: {statusCode: response.statusCode, headers: response.headers, text: responseText}}), 'utf8');"+"fs.unlinkSync('"+syncFile+"');"+"});"+"response.on('error', function(error) {"+"fs.writeFileSync('"+contentFile+"', JSON.stringify({err: error}), 'utf8');"+"fs.unlinkSync('"+syncFile+"');"+"});"+"}).on('error', function(error) {"+"fs.writeFileSync('"+contentFile+"', JSON.stringify({err: error}), 'utf8');"+"fs.unlinkSync('"+syncFile+"');"+"});"+(data?"req.write('"+JSON.stringify(data).slice(1,-1).replace(/'/g,"\\'")+"');":"")+"req.end();";var syncProc=spawn(process.argv[0],["-e",execString]);while(fs.existsSync(syncFile)){}
var resp=JSON.parse(fs.readFileSync(contentFile,'utf8'));syncProc.stdin.end();fs.unlinkSync(contentFile);if(resp.err){self.handleError(resp.err)}else{response=resp.data;self.status=resp.data.statusCode;self.responseText=resp.data.text;setState(self.DONE)}}};this.handleError=function(error){this.status=0;this.statusText=error;this.responseText=error.stack;errorFlag=!0;setState(this.DONE);this.dispatchEvent('error')};this.abort=function(){if(request){request.abort();request=null}
headers=defaultHeaders;this.status=0;this.responseText="";this.responseXML="";errorFlag=!0;if(this.readyState!==this.UNSENT&&(this.readyState!==this.OPENED||sendFlag)&&this.readyState!==this.DONE){sendFlag=!1;setState(this.DONE)}
this.readyState=this.UNSENT;this.dispatchEvent('abort')};this.addEventListener=function(event,callback){if(!(event in listeners)){listeners[event]=[]}
listeners[event].push(callback)};this.removeEventListener=function(event,callback){if(event in listeners){listeners[event]=listeners[event].filter(function(ev){return ev!==callback})}};this.dispatchEvent=function(event){if(typeof self["on"+event]==="function"){self["on"+event]()}
if(event in listeners){for(var i=0,len=listeners[event].length;i<len;i++){listeners[event][i].call(self)}}};var setState=function(state){if(state==self.LOADING||self.readyState!==state){self.readyState=state;if(settings.async||self.readyState<self.OPENED||self.readyState===self.DONE){self.dispatchEvent("readystatechange")}
if(self.readyState===self.DONE&&!errorFlag){self.dispatchEvent("load");self.dispatchEvent("loadend")}}}}}).call(this,require('_process'),require("buffer").Buffer)},{"_process":121,"buffer":48,"child_process":1,"fs":1,"http":158,"https":100,"url":165}],419:[function(require,module,exports){arguments[4][169][0].apply(exports,arguments)},{"dup":169}]},[170])
