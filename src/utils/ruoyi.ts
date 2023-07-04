/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */

import axios from 'axios';
import { getToken } from './auth';
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const mimeMap = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  oss: 'application/octet-stream',
  xls: 'application/vnd.ms-excel',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  rar: 'application/x-rar-compressed',
  txt: 'text/plain',
};

// 日期格式化
export function parseTime(time: any, pattern?: string) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === 'string') {
      time = time
        .replace(new RegExp(/-/gm), '/')
        .replace('T', ' ')
        .replace(new RegExp(/\.[\d]{3}/gm), '');
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj: Record<string, any> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
  return timeStr;
}

// 表单重置
export function resetForm(refName: string) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 添加日期范围
export function addDateRange(params: any, dateRange: any[], propName?: string[]) {
  const search = params;
  search.params =
        typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params)
          ? search.params
          : {};
  dateRange = Array.isArray(dateRange) ? dateRange : [];
  if (typeof propName === 'undefined') {
    search.params['beginTime'] = dateRange[0];
    search.params['endTime'] = dateRange[1];
  } else {
    search.params[propName[0]] = dateRange[0];
    search.params[propName[1]] = dateRange[1];
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas: any, value: any) {
  if (value === undefined) {
    return '';
  }
  const actions = [];
  Object.keys(datas).some(key => {
    if (datas[key].value === '' + value) {
      actions.push(datas[key].label);
      return true;
    }
  });
  if (actions.length === 0) {
    actions.push(value);
  }
  return actions.join('');
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas: any, value: any, separator: any) {
  if (value === undefined || value.length === 0) {
    return '';
  }
  if (Array.isArray(value)) {
    value = value.join(',');
  }
  const actions: any[] = [];
  const currentSeparator = undefined === separator ? ',' : separator;
  const temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some(val => {
    let match = false;
    Object.keys(datas).some(key => {
      if (datas[key].value === '' + temp[val]) {
        actions.push(datas[key].label + currentSeparator);
        match = true;
      }
    });
    if (!match) {
      actions.push(temp[val] + currentSeparator);
    }
  });
  return actions.join('').substring(0, actions.join('').length - 1);
}

// 字符串格式化(%s )
export function sprintf(str: string) {
  // eslint-disable-next-line prefer-rest-params
  const args = arguments;
  let flag = true,
    i = 1;
  str = str.replace(/%s/g, function () {
    const arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return arg;
  });
  return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str: string) {
  if (!str || str === 'undefined' || str === 'null') {
    return '';
  }
  return str;
}

// // 数据合并
// export function mergeRecursive(source, target) {
//     for (var p in target) {
//         try {
//             if (target[p].constructor == Object) {
//                 source[p] = mergeRecursive(source[p], target[p]);
//             } else {
//                 source[p] = target[p];
//             }
//         } catch (e) {
//             source[p] = target[p];
//         }
//     }
//     return source;
// }

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data: any, id: any, parentId?: any, children?: any) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  };

  const childrenListMap: any = {};
  const nodeIds: any = {};
  const tree = [];

  for (const d of data) {
    const parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o: any) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params: any) {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = encodeURIComponent(propName) + '=';
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const params = propName + '[' + key + ']';
            const subPart = encodeURIComponent(params) + '=';
            result += subPart + encodeURIComponent(value[key]) + '&';
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&';
      }
    }
  }
  return result;
}

// 返回项目路径
export function getNormalPath(p: any) {
  if (p.length === 0 || !p || p === 'undefined') {
    return p;
  }
  const res = p.replace('//', '/');
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1);
  }
  return res;
}

// 验证是否为blob格式
export function blobValidate(data: any) {
  return data.type !== 'application/json';
}


export function downLoadExcel(url: string, params: any, name: any, method = 'get') {
  url = baseUrl + url;
  axios({
    method: method,
    url: url,
    responseType: 'blob',
    data: params,
    headers: { Authorization: 'Bearer ' + getToken() },
  }).then(res => {
    resolveBlob(res, mimeMap.xlsx, name);
  });
}

export function downLoadZip(str: string, name: string) {
  const url = baseUrl + str;
  axios({
    method: 'get',
    url: url,
    responseType: 'blob',
    headers: { Authorization: 'Bearer ' + getToken() },
  }).then(res => {
    resolveBlob(res, mimeMap.zip, name);
  });
}

export function downLoadFile(url: string, type: string, name: string) {
  url = baseUrl + url;
  axios({
    method: 'get',
    url: url,
    responseType: 'blob',
    headers: { Authorization: 'Bearer ' + getToken() },
  }).then(res => {
    resolveBlob(res, mimeMap[type], name);
  });
}

/**
 * 解析blob响应内容并下载
 * @param {*} res blob响应内容
 * @param {String} mimeType MIME类型
 */
export function resolveBlob(res: any, mimeType: any, name: any) {
  const aLink = document.createElement('a');
  const blob = new Blob([res.data], { type: mimeType });

  //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
  const patt = new RegExp('filename=([^;]+\\.[^\\.;]+);*');
  const contentDisposition = decodeURI(res.headers['content-disposition']);
  const result = patt.exec(contentDisposition);
  let fileName = name || result&&result[1];
  // eslint-disable-next-line no-useless-escape
  fileName = fileName.replace(/\"/g, '');
  aLink.style.display = 'none';
  aLink.href = URL.createObjectURL(blob);
  aLink.setAttribute('download', decodeURI(fileName)); // 设置下载文件名称
  document.body.appendChild(aLink);
  console.log(aLink);

  aLink.click();
  URL.revokeObjectURL(aLink.href); // 清除引用
  document.body.removeChild(aLink);
}
