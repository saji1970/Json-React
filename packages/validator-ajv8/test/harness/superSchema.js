"use strict";
exports["-66914362"] = validate10;
const schema11 = {"definitions":{"foo":{"type":"object","properties":{"name":{"type":"string"}}},"price":{"title":"Price per task ($)","type":"number","multipleOf":0.03,"minimum":1},"passwords":{"type":"object","properties":{"pass1":{"type":"string"},"pass2":{"type":"string"}},"required":["pass1","pass2"]},"list":{"type":"array","items":{"type":"string"}},"choice1":{"type":"object","properties":{"choice":{"type":"string","const":"one"},"other":{"type":"number"}}},"choice2":{"type":"object","properties":{"choice":{"type":"string","const":"two"},"more":{"type":"string"}}}},"type":"object","properties":{"foo":{"type":"string"},"price":{"$ref":"#/definitions/price"},"passwords":{"$ref":"#/definitions/passwords"},"dataUrlWithName":{"type":"string","format":"data-url"},"phone":{"type":"string","format":"phone-us"},"multi":{"anyOf":[{"$ref":"#/definitions/foo"}]},"list":{"$ref":"#/definitions/list"},"single":{"oneOf":[{"$ref":"#/definitions/choice1"},{"$ref":"#/definitions/choice2"}]},"anything":{"type":"object","additionalProperties":{"type":"string"}}},"$id":"-66914362"};
const schema12 = {"title":"Price per task ($)","type":"number","multipleOf":0.03,"minimum":1};
const schema13 = {"type":"object","properties":{"pass1":{"type":"string"},"pass2":{"type":"string"}},"required":["pass1","pass2"]};
const schema14 = {"type":"object","properties":{"name":{"type":"string"}}};
const schema15 = {"type":"array","items":{"type":"string"}};
const schema16 = {"type":"object","properties":{"choice":{"type":"string","const":"one"},"other":{"type":"number"}}};
const schema17 = {"type":"object","properties":{"choice":{"type":"string","const":"two"},"more":{"type":"string"}}};
const formats0 = /^data:([a-z]+\/[a-z0-9-+.]+)?;(?:name=(.*);)?base64,(.*)$/;

function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="-66914362" */;
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.foo !== undefined){
let data0 = data.foo;
if(typeof data0 !== "string"){
const err0 = {instancePath:instancePath+"/foo",schemaPath:"#/properties/foo/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema11.properties.foo.type,parentSchema:schema11.properties.foo,data:data0};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
if(data.price !== undefined){
let data1 = data.price;
if(typeof data1 == "number"){
if(data1 < 1 || isNaN(data1)){
const err1 = {instancePath:instancePath+"/price",schemaPath:"#/definitions/price/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1",schema:1,parentSchema:schema12,data:data1};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
let res0;
if((0.03 === 0 || (res0 = data1/0.03, Math.abs(Math.round(res0) - res0) > 1e-8))){
const err2 = {instancePath:instancePath+"/price",schemaPath:"#/definitions/price/multipleOf",keyword:"multipleOf",params:{multipleOf: 0.03},message:"must be multiple of 0.03",schema:0.03,parentSchema:schema12,data:data1};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
else {
const err3 = {instancePath:instancePath+"/price",schemaPath:"#/definitions/price/type",keyword:"type",params:{type: "number"},message:"must be number",schema:schema12.type,parentSchema:schema12,data:data1};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.passwords !== undefined){
let data2 = data.passwords;
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
if(data2.pass1 === undefined){
const err4 = {instancePath:instancePath+"/passwords",schemaPath:"#/definitions/passwords/required",keyword:"required",params:{missingProperty: "pass1"},message:"must have required property '"+"pass1"+"'",schema:schema13.required,parentSchema:schema13,data:data2};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data2.pass2 === undefined){
const err5 = {instancePath:instancePath+"/passwords",schemaPath:"#/definitions/passwords/required",keyword:"required",params:{missingProperty: "pass2"},message:"must have required property '"+"pass2"+"'",schema:schema13.required,parentSchema:schema13,data:data2};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data2.pass1 !== undefined){
let data3 = data2.pass1;
if(typeof data3 !== "string"){
const err6 = {instancePath:instancePath+"/passwords/pass1",schemaPath:"#/definitions/passwords/properties/pass1/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema13.properties.pass1.type,parentSchema:schema13.properties.pass1,data:data3};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data2.pass2 !== undefined){
let data4 = data2.pass2;
if(typeof data4 !== "string"){
const err7 = {instancePath:instancePath+"/passwords/pass2",schemaPath:"#/definitions/passwords/properties/pass2/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema13.properties.pass2.type,parentSchema:schema13.properties.pass2,data:data4};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
}
else {
const err8 = {instancePath:instancePath+"/passwords",schemaPath:"#/definitions/passwords/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema13.type,parentSchema:schema13,data:data2};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.dataUrlWithName !== undefined){
let data5 = data.dataUrlWithName;
if(typeof data5 === "string"){
if(!(formats0.test(data5))){
const err9 = {instancePath:instancePath+"/dataUrlWithName",schemaPath:"#/properties/dataUrlWithName/format",keyword:"format",params:{format: "data-url"},message:"must match format \""+"data-url"+"\"",schema:"data-url",parentSchema:schema11.properties.dataUrlWithName,data:data5};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/dataUrlWithName",schemaPath:"#/properties/dataUrlWithName/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema11.properties.dataUrlWithName.type,parentSchema:schema11.properties.dataUrlWithName,data:data5};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.phone !== undefined){
let data6 = data.phone;
if(!(typeof data6 === "string")){
const err11 = {instancePath:instancePath+"/phone",schemaPath:"#/properties/phone/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema11.properties.phone.type,parentSchema:schema11.properties.phone,data:data6};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.multi !== undefined){
let data7 = data.multi;
const _errs18 = errors;
let valid4 = false;
const _errs19 = errors;
if(data7 && typeof data7 == "object" && !Array.isArray(data7)){
if(data7.name !== undefined){
let data8 = data7.name;
if(typeof data8 !== "string"){
const err12 = {instancePath:instancePath+"/multi/name",schemaPath:"#/definitions/foo/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema14.properties.name.type,parentSchema:schema14.properties.name,data:data8};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath:instancePath+"/multi",schemaPath:"#/definitions/foo/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema14.type,parentSchema:schema14,data:data7};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
var _valid0 = _errs19 === errors;
valid4 = valid4 || _valid0;
if(!valid4){
const err14 = {instancePath:instancePath+"/multi",schemaPath:"#/properties/multi/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf",schema:schema11.properties.multi.anyOf,parentSchema:schema11.properties.multi,data:data7};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
else {
errors = _errs18;
if(vErrors !== null){
if(_errs18){
vErrors.length = _errs18;
}
else {
vErrors = null;
}
}
}
}
if(data.list !== undefined){
let data9 = data.list;
if(Array.isArray(data9)){
const len0 = data9.length;
for(let i0=0; i0<len0; i0++){
let data10 = data9[i0];
if(typeof data10 !== "string"){
const err15 = {instancePath:instancePath+"/list/" + i0,schemaPath:"#/definitions/list/items/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema15.items.type,parentSchema:schema15.items,data:data10};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
else {
const err16 = {instancePath:instancePath+"/list",schemaPath:"#/definitions/list/type",keyword:"type",params:{type: "array"},message:"must be array",schema:schema15.type,parentSchema:schema15,data:data9};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.single !== undefined){
let data11 = data.single;
const _errs30 = errors;
let valid10 = false;
let passing0 = null;
const _errs31 = errors;
if(data11 && typeof data11 == "object" && !Array.isArray(data11)){
if(data11.choice !== undefined){
let data12 = data11.choice;
if(typeof data12 !== "string"){
const err17 = {instancePath:instancePath+"/single/choice",schemaPath:"#/definitions/choice1/properties/choice/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema16.properties.choice.type,parentSchema:schema16.properties.choice,data:data12};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if("one" !== data12){
const err18 = {instancePath:instancePath+"/single/choice",schemaPath:"#/definitions/choice1/properties/choice/const",keyword:"const",params:{allowedValue: "one"},message:"must be equal to constant",schema:"one",parentSchema:schema16.properties.choice,data:data12};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data11.other !== undefined){
let data13 = data11.other;
if(!(typeof data13 == "number")){
const err19 = {instancePath:instancePath+"/single/other",schemaPath:"#/definitions/choice1/properties/other/type",keyword:"type",params:{type: "number"},message:"must be number",schema:schema16.properties.other.type,parentSchema:schema16.properties.other,data:data13};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
}
else {
const err20 = {instancePath:instancePath+"/single",schemaPath:"#/definitions/choice1/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema16.type,parentSchema:schema16,data:data11};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
var _valid1 = _errs31 === errors;
if(_valid1){
valid10 = true;
passing0 = 0;
}
const _errs38 = errors;
if(data11 && typeof data11 == "object" && !Array.isArray(data11)){
if(data11.choice !== undefined){
let data14 = data11.choice;
if(typeof data14 !== "string"){
const err21 = {instancePath:instancePath+"/single/choice",schemaPath:"#/definitions/choice2/properties/choice/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema17.properties.choice.type,parentSchema:schema17.properties.choice,data:data14};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if("two" !== data14){
const err22 = {instancePath:instancePath+"/single/choice",schemaPath:"#/definitions/choice2/properties/choice/const",keyword:"const",params:{allowedValue: "two"},message:"must be equal to constant",schema:"two",parentSchema:schema17.properties.choice,data:data14};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data11.more !== undefined){
let data15 = data11.more;
if(typeof data15 !== "string"){
const err23 = {instancePath:instancePath+"/single/more",schemaPath:"#/definitions/choice2/properties/more/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema17.properties.more.type,parentSchema:schema17.properties.more,data:data15};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath:instancePath+"/single",schemaPath:"#/definitions/choice2/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema17.type,parentSchema:schema17,data:data11};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
var _valid1 = _errs38 === errors;
if(_valid1 && valid10){
valid10 = false;
passing0 = [passing0, 1];
}
else {
if(_valid1){
valid10 = true;
passing0 = 1;
}
}
if(!valid10){
const err25 = {instancePath:instancePath+"/single",schemaPath:"#/properties/single/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf",schema:schema11.properties.single.oneOf,parentSchema:schema11.properties.single,data:data11};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
else {
errors = _errs30;
if(vErrors !== null){
if(_errs30){
vErrors.length = _errs30;
}
else {
vErrors = null;
}
}
}
}
if(data.anything !== undefined){
let data16 = data.anything;
if(data16 && typeof data16 == "object" && !Array.isArray(data16)){
for(const key0 in data16){
let data17 = data16[key0];
if(typeof data17 !== "string"){
const err26 = {instancePath:instancePath+"/anything/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/anything/additionalProperties/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema11.properties.anything.additionalProperties.type,parentSchema:schema11.properties.anything.additionalProperties,data:data17};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
}
else {
const err27 = {instancePath:instancePath+"/anything",schemaPath:"#/properties/anything/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema11.properties.anything.type,parentSchema:schema11.properties.anything,data:data16};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
else {
const err28 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema11.type,parentSchema:schema11,data};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
validate10.errors = vErrors;
return errors === 0;
}

exports["-1a32fe51"] = validate11;
const schema18 = {"type":"object","properties":{"name":{"type":"string"}},"anyOf":[{"required":["name"]}],"$id":"-1a32fe51"};

function validate11(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="-1a32fe51" */;
let vErrors = null;
let errors = 0;
const _errs1 = errors;
let valid0 = false;
const _errs2 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.name === undefined){
const err0 = {instancePath,schemaPath:"#/anyOf/0/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'",schema:schema18.anyOf[0].required,parentSchema:schema18.anyOf[0],data};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
var _valid0 = _errs2 === errors;
valid0 = valid0 || _valid0;
if(!valid0){
const err1 = {instancePath,schemaPath:"#/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf",schema:schema18.anyOf,parentSchema:schema18,data};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
else {
errors = _errs1;
if(vErrors !== null){
if(_errs1){
vErrors.length = _errs1;
}
else {
vErrors = null;
}
}
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.name !== undefined){
let data0 = data.name;
if(typeof data0 !== "string"){
const err2 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema18.properties.name.type,parentSchema:schema18.properties.name,data:data0};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
}
else {
const err3 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema18.type,parentSchema:schema18,data};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
validate11.errors = vErrors;
return errors === 0;
}

exports["4aa7be7e"] = validate12;
const schema19 = {"type":"object","properties":{"choice":{"type":"string","const":"one"},"other":{"type":"number"}},"anyOf":[{"required":["choice"]},{"required":["other"]}],"$id":"4aa7be7e"};

function validate12(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="4aa7be7e" */;
let vErrors = null;
let errors = 0;
const _errs1 = errors;
let valid0 = false;
const _errs2 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.choice === undefined){
const err0 = {instancePath,schemaPath:"#/anyOf/0/required",keyword:"required",params:{missingProperty: "choice"},message:"must have required property '"+"choice"+"'",schema:schema19.anyOf[0].required,parentSchema:schema19.anyOf[0],data};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
var _valid0 = _errs2 === errors;
valid0 = valid0 || _valid0;
if(!valid0){
const _errs3 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.other === undefined){
const err1 = {instancePath,schemaPath:"#/anyOf/1/required",keyword:"required",params:{missingProperty: "other"},message:"must have required property '"+"other"+"'",schema:schema19.anyOf[1].required,parentSchema:schema19.anyOf[1],data};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
var _valid0 = _errs3 === errors;
valid0 = valid0 || _valid0;
}
if(!valid0){
const err2 = {instancePath,schemaPath:"#/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf",schema:schema19.anyOf,parentSchema:schema19,data};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
else {
errors = _errs1;
if(vErrors !== null){
if(_errs1){
vErrors.length = _errs1;
}
else {
vErrors = null;
}
}
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.choice !== undefined){
let data0 = data.choice;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/choice",schemaPath:"#/properties/choice/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema19.properties.choice.type,parentSchema:schema19.properties.choice,data:data0};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("one" !== data0){
const err4 = {instancePath:instancePath+"/choice",schemaPath:"#/properties/choice/const",keyword:"const",params:{allowedValue: "one"},message:"must be equal to constant",schema:"one",parentSchema:schema19.properties.choice,data:data0};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.other !== undefined){
let data1 = data.other;
if(!(typeof data1 == "number")){
const err5 = {instancePath:instancePath+"/other",schemaPath:"#/properties/other/type",keyword:"type",params:{type: "number"},message:"must be number",schema:schema19.properties.other.type,parentSchema:schema19.properties.other,data:data1};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema19.type,parentSchema:schema19,data};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate12.errors = vErrors;
return errors === 0;
}

exports["-48288a90"] = validate13;
const schema20 = {"type":"object","properties":{"choice":{"type":"string","const":"two"},"more":{"type":"string"}},"anyOf":[{"required":["choice"]},{"required":["more"]}],"$id":"-48288a90"};

function validate13(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="-48288a90" */;
let vErrors = null;
let errors = 0;
const _errs1 = errors;
let valid0 = false;
const _errs2 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.choice === undefined){
const err0 = {instancePath,schemaPath:"#/anyOf/0/required",keyword:"required",params:{missingProperty: "choice"},message:"must have required property '"+"choice"+"'",schema:schema20.anyOf[0].required,parentSchema:schema20.anyOf[0],data};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
var _valid0 = _errs2 === errors;
valid0 = valid0 || _valid0;
if(!valid0){
const _errs3 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.more === undefined){
const err1 = {instancePath,schemaPath:"#/anyOf/1/required",keyword:"required",params:{missingProperty: "more"},message:"must have required property '"+"more"+"'",schema:schema20.anyOf[1].required,parentSchema:schema20.anyOf[1],data};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
var _valid0 = _errs3 === errors;
valid0 = valid0 || _valid0;
}
if(!valid0){
const err2 = {instancePath,schemaPath:"#/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf",schema:schema20.anyOf,parentSchema:schema20,data};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
else {
errors = _errs1;
if(vErrors !== null){
if(_errs1){
vErrors.length = _errs1;
}
else {
vErrors = null;
}
}
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.choice !== undefined){
let data0 = data.choice;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/choice",schemaPath:"#/properties/choice/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema20.properties.choice.type,parentSchema:schema20.properties.choice,data:data0};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("two" !== data0){
const err4 = {instancePath:instancePath+"/choice",schemaPath:"#/properties/choice/const",keyword:"const",params:{allowedValue: "two"},message:"must be equal to constant",schema:"two",parentSchema:schema20.properties.choice,data:data0};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.more !== undefined){
let data1 = data.more;
if(typeof data1 !== "string"){
const err5 = {instancePath:instancePath+"/more",schemaPath:"#/properties/more/type",keyword:"type",params:{type: "string"},message:"must be string",schema:schema20.properties.more.type,parentSchema:schema20.properties.more,data:data1};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object",schema:schema20.type,parentSchema:schema20,data};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate13.errors = vErrors;
return errors === 0;
}
