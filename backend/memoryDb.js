const bcrypt = require('bcryptjs');

// ============== In-memory data stores ==============
// 内存数据库实现，用于 Node v24 兼容性
let users = [];
let tools = [];
let comments = [];
let favorites = [];
let toolViews = [];
let searchHistory = [];

// ============== Data accessor by table name ==============
function getStore(table) {
  switch (table.toLowerCase()) {
    case 'users': return users;
    case 'tools': return tools;
    case 'comments': return comments;
    case 'favorites': return favorites;
    case 'tool_views': return toolViews;
    case 'search_history': return searchHistory;
    default: return null;
  }
}

// ============== Seed data ==============
const initDatabase = () => {
  if (tools.length === 0) {
    tools = [
      { id: 'json-formatter', name: 'JSON 格式化工具', category: '开发工具', description: '格式化和验证 JSON 数据，支持语法高亮显示和错误提示', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'color-picker', name: '颜色选择器', category: '设计工具', description: '从屏幕任意位置拾取颜色值，支持多种颜色格式输出（HEX、RGB、HSL）', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'qr-code-generator', name: '二维码生成器', category: '实用工具', description: '为网址、文本、联系方式等生成二维码，支持自定义尺寸和颜色', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="9" y="9" width="6" height="6"/><circle cx="12" cy="12" r="1"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'password-generator', name: '密码生成器', category: '安全工具', description: '生成强随机密码，支持自定义长度、字符类型和排除字符', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'base64-converter', name: 'Base64 编码/解码器', category: '开发工具', description: '对字符串进行 Base64 编码和解码，支持批量处理和文件转换', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'unit-converter', name: '单位转换器', category: '实用工具', description: '在不同计量单位之间进行转换，包括长度、重量、面积、温度等', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'timestamp-converter', name: '时间戳转换器', category: '开发工具', description: '在时间戳和人类可读时间之间进行转换，支持多种时间格式', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'url-encoder', name: 'URL 编码/解码器', category: '开发工具', description: '对 URL 进行编码和解码，支持中文和特殊字符处理', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'regex-tester', name: '正则表达式测试器', category: '开发工具', description: '测试和验证正则表达式，支持实时匹配和分组显示', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'calculator', name: '计算器', category: '实用工具', description: '基础计算器，支持加减乘除等常用运算', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
      { id: 'sanguosha-game', name: '三国杀', category: '娱乐工具', description: '多人联机三国杀游戏，支持语音聊天', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    ];
  }

  if (users.length === 0) {
    users = [
      { id: 'user-1', email: 'admin@toolbox.com', password: bcrypt.hashSync('123456', 10), username: '管理员', avatar_url: null, bio: '工具网站管理员，喜欢开发各种实用工具', created_at: new Date().toISOString() },
      { id: 'user-2', email: 'test@example.com', password: bcrypt.hashSync('123456', 10), username: '测试用户', avatar_url: null, bio: '普通用户，喜欢使用各种在线工具', created_at: new Date().toISOString() },
      { id: 'user-3', email: 'developer@code.com', password: bcrypt.hashSync('123456', 10), username: '开发者', avatar_url: null, bio: '全栈开发者，热爱编程和技术分享', created_at: new Date().toISOString() },
    ];
  }

  if (comments.length === 0) {
    comments = [
      { id: 'comment-1', user_id: 'user-1', tool_id: 'json-formatter', parent_id: null, content: '非常好用的JSON格式化工具，帮我解决了很多调试问题！', rating: 5, likes: 2, created_at: new Date().toISOString() },
      { id: 'comment-2', user_id: 'user-2', tool_id: 'json-formatter', parent_id: 'comment-1', content: '同感！我也是经常用这个工具调试接口', rating: 0, likes: 1, created_at: new Date().toISOString() },
      { id: 'comment-3', user_id: 'user-3', tool_id: 'json-formatter', parent_id: null, content: '界面简洁，功能强大，强烈推荐！', rating: 5, likes: 3, created_at: new Date().toISOString() },
      { id: 'comment-4', user_id: 'user-1', tool_id: 'password-generator', parent_id: null, content: '密码生成器很实用，可以自定义各种参数。', rating: 4, likes: 1, created_at: new Date().toISOString() },
      { id: 'comment-5', user_id: 'user-2', tool_id: 'qr-code-generator', parent_id: null, content: '二维码生成速度很快，支持自定义颜色很棒！', rating: 5, likes: 4, created_at: new Date().toISOString() },
      { id: 'comment-6', user_id: 'user-3', tool_id: 'color-picker', parent_id: null, content: '颜色选择器很好用，HEX/RGB/HSL转换很方便。', rating: 4, likes: 2, created_at: new Date().toISOString() },
    ];
  }

  console.log('内存数据库初始化完成');
};

// ============== SQL parser & executor ==============

function parseColumnRef(colRef) {
  colRef = colRef.trim();
  let alias = null;
  const asMatch = colRef.match(/^(.+)\s+AS\s+(\w+)$/i);
  if (asMatch) {
    colRef = asMatch[1].trim();
    alias = asMatch[2];
  }
  const dotMatch = colRef.match(/^(\w+)\.(\*|\w+)$/);
  if (dotMatch) {
    return { table: dotMatch[1].toLowerCase(), name: dotMatch[2], alias: alias };
  }
  return { table: null, name: colRef, alias: alias };
}

function parseSQL(sql) {
  sql = sql.trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ');
  const upper = sql.toUpperCase();

  const parsed = {
    type: null,
    selectCols: [],
    insertTable: null,
    insertCols: [],
    updateTable: null,
    deleteTable: null,
    setClauses: [],
    mainTable: null,
    mainAlias: null,
    joins: [],
    whereClauses: [],
    orderBy: [],
    limit: null,
    distinct: false,
    isCount: false,
  };

  // Determine type
  if (upper.startsWith('SELECT')) parsed.type = 'SELECT';
  else if (upper.startsWith('INSERT INTO')) parsed.type = 'INSERT';
  else if (upper.startsWith('UPDATE')) parsed.type = 'UPDATE';
  else if (upper.startsWith('DELETE FROM')) parsed.type = 'DELETE';

  if (parsed.type === 'SELECT') {
    if (/^\s*SELECT\s+DISTINCT\s/i.test(upper)) parsed.distinct = true;
    if (/COUNT\(\*\)\s+AS\s+count/i.test(upper)) parsed.isCount = true;

    const colMatch = sql.match(/^SELECT\s+(DISTINCT\s+)?(.+?)\s+FROM\s/i);
    if (colMatch) {
      const colStr = colMatch[2];
      const cols = [];
      let depth = 0;
      let current = '';
      for (const ch of colStr) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (ch === ',' && depth === 0) {
          cols.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      if (current.trim()) cols.push(current.trim());
      parsed.selectCols = cols.map(parseColumnRef);
    }

    const fromMatch = sql.match(/FROM\s+(\w+)(?:\s+(\w+))?(?:\s|$|JOIN|WHERE|ORDER|LIMIT)/i);
    if (fromMatch) {
      parsed.mainTable = fromMatch[1].toLowerCase();
      parsed.mainAlias = fromMatch[2] ? fromMatch[2].toLowerCase() : null;
    }

    const joinRegex = /(?:INNER\s+)?JOIN\s+(\w+)(?:\s+(\w+))?\s+ON\s+(\w+\.\w+)\s*=\s*(\w+\.\w+)/gi;
    let jm;
    while ((jm = joinRegex.exec(sql)) !== null) {
      parsed.joins.push({
        table: jm[1].toLowerCase(),
        alias: jm[2] ? jm[2].toLowerCase() : null,
        leftRef: parseColumnRef(jm[3]),
        rightRef: parseColumnRef(jm[4]),
      });
    }
  }

  if (parsed.type === 'INSERT') {
    const insMatch = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (insMatch) {
      parsed.insertTable = insMatch[1].toLowerCase();
      parsed.insertCols = insMatch[2].split(',').map(c => c.trim());
    }
  }

  if (parsed.type === 'UPDATE') {
    const updMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
    if (updMatch) {
      parsed.updateTable = updMatch[1].toLowerCase();
      const setParts = updMatch[2].split(',');
      for (const part of setParts) {
        const eqMatch = part.trim().match(/^(\w+)\s*=\s*(.+)$/);
        if (eqMatch) {
          const field = eqMatch[1];
          const val = eqMatch[2].trim();
          if (val === '?') {
            parsed.setClauses.push({ field, type: 'param' });
          } else if (/^\w+\s*\+\s*\d+$/.test(val)) {
            const incMatch = val.match(/^(\w+)\s*\+\s*(\d+)$/);
            parsed.setClauses.push({ field, type: 'inc', incField: incMatch[1], incBy: parseInt(incMatch[2]) });
          }
        }
      }
    }
  }

  if (parsed.type === 'DELETE') {
    const delMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
    if (delMatch) {
      parsed.deleteTable = delMatch[1].toLowerCase();
    }
  }

  // WHERE clauses (common)
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s*$)/i);
  if (whereMatch) {
    const whereStr = whereMatch[1];
    const parts = whereStr.split(/\s+(AND|OR)\s+/i);
    let logicalOp = 'AND';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (/^(AND|OR)$/i.test(part)) {
        logicalOp = part.toUpperCase();
        continue;
      }
      const condMatch = part.match(/^(\w+\.?\w*)\s*(=|!=|LIKE|>|<|>=|<=)\s*(.+)$/i);
      if (condMatch) {
        const rhs = condMatch[3].trim();
        if (rhs === '?') {
          parsed.whereClauses.push({
            field: condMatch[1].toLowerCase(),
            op: condMatch[2].toUpperCase(),
            type: 'param',
            logicalOp,
          });
        } else {
          let val = rhs;
          if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
            val = val.slice(1, -1);
          } else if (!isNaN(val)) {
            val = Number(val);
          }
          parsed.whereClauses.push({
            field: condMatch[1].toLowerCase(),
            op: condMatch[2].toUpperCase(),
            type: 'literal',
            value: val,
            logicalOp,
          });
        }
      }
    }
  }

  // ORDER BY
  const orderMatch = sql.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|\s*$)/i);
  if (orderMatch) {
    const orderCols = orderMatch[1].split(',');
    for (const oc of orderCols) {
      const parts = oc.trim().split(/\s+/);
      parsed.orderBy.push({
        field: parts[0].toLowerCase(),
        dir: parts[1] && parts[1].toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      });
    }
  }

  // LIMIT
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    parsed.limit = parseInt(limitMatch[1]);
  }

  return parsed;
}

function matchesWhere(row, whereClause, paramValue) {
  const { field, op } = whereClause;
  const dotIdx = field.indexOf('.');
  const colName = dotIdx >= 0 ? field.substring(dotIdx + 1) : field;
  let rowValue = row[colName];

  if (op === 'LIKE') {
    const pattern = String(paramValue).replace(/%/g, '.*').replace(/_/g, '.');
    const re = new RegExp('^' + pattern + '$', 'i');
    return re.test(String(rowValue || ''));
  }

  if (op === '=') {
    return rowValue === paramValue;
  }

  return false;
}

function applyWhere(data, parsed, params, paramStartIdx) {
  if (parsed.whereClauses.length === 0) return data;

  let paramIdx = paramStartIdx;
  const conditions = parsed.whereClauses.map(wc => {
    if (wc.type === 'param') {
      const val = params[paramIdx++];
      return { ...wc, value: val };
    }
    return wc;
  });

  return data.filter(row => {
    let result = true;
    let currentOp = 'AND';
    for (const cond of conditions) {
      const match = matchesWhere(row, cond, cond.value);
      if (currentOp === 'AND') {
        result = result && match;
      } else {
        result = result || match;
      }
      currentOp = cond.logicalOp;
    }
    return result;
  });
}

function applyOrderBy(data, parsed) {
  if (parsed.orderBy.length === 0) return data;
  return [...data].sort((a, b) => {
    for (const ob of parsed.orderBy) {
      const dotIdx = ob.field.indexOf('.');
      const colName = dotIdx >= 0 ? ob.field.substring(dotIdx + 1) : ob.field;
      const va = a[colName] != null ? a[colName] : '';
      const vb = b[colName] != null ? b[colName] : '';
      if (va < vb) return ob.dir === 'DESC' ? 1 : -1;
      if (va > vb) return ob.dir === 'DESC' ? -1 : 1;
    }
    return 0;
  });
}

function projectColumns(rows, parsed) {
  if (parsed.isCount) {
    return [{ count: rows.length }];
  }

  const cols = parsed.selectCols;
  if (cols.length === 0) return rows;
  if (cols.length === 1 && cols[0].name === '*' && !cols[0].table) return rows;

  // Determine if any column is a star
  const hasStar = cols.some(c => c.name === '*');

  return rows.map(row => {
    // If star present, start with all fields; otherwise empty
    const result = hasStar ? { ...row } : {};
    for (const col of cols) {
      if (col.name === '*') continue; // star already handled by spread
      if (col.alias) {
        const dotIdx = col.name.indexOf('.');
        const srcCol = dotIdx >= 0 ? col.name.substring(dotIdx + 1) : col.name;
        result[col.alias] = row[srcCol] !== undefined ? row[srcCol] : row[col.name];
      } else {
        const dotIdx = col.name.indexOf('.');
        const srcCol = dotIdx >= 0 ? col.name.substring(dotIdx + 1) : col.name;
        result[srcCol] = row[srcCol] !== undefined ? row[srcCol] : row[col.name];
      }
    }
    return result;
  });
}

function executeJoin(parsed, params) {
  let mainData = [...getStore(parsed.mainTable)];

  for (const join of parsed.joins) {
    const joinData = getStore(join.table);
    const leftCol = join.leftRef.name;
    const rightCol = join.rightRef.name;

    const newRows = [];
    for (const leftRow of mainData) {
      for (const rightRow of joinData) {
        if (leftRow[leftCol] === rightRow[rightCol]) {
          newRows.push({ ...rightRow, ...leftRow });
        }
      }
    }
    mainData = newRows;
  }

  let result = applyWhere(mainData, parsed, params, 0);
  result = applyOrderBy(result, parsed);
  if (parsed.limit) {
    result = result.slice(0, parsed.limit);
  }
  result = projectColumns(result, parsed);
  return result;
}

// ============== Statement class (better-sqlite3 compatible) ==============
class Statement {
  constructor(parsed) {
    this.parsed = parsed;
  }

  get(...params) {
    if (this.parsed.type === 'SELECT') {
      let result;
      if (this.parsed.joins.length > 0) {
        result = executeJoin(this.parsed, params);
      } else {
        const store = getStore(this.parsed.mainTable);
        let data = [...store];
        const filtered = applyWhere(data, this.parsed, params, 0);
        result = projectColumns(filtered, this.parsed);
      }
      return result[0];
    }
    return undefined;
  }

  all(...params) {
    if (this.parsed.type === 'SELECT') {
      let data;
      if (this.parsed.joins.length > 0) {
        data = executeJoin(this.parsed, params);
      } else {
        const store = getStore(this.parsed.mainTable);
        data = [...store];
        data = applyWhere(data, this.parsed, params, 0);
        data = applyOrderBy(data, this.parsed);
        if (this.parsed.limit) {
          data = data.slice(0, this.parsed.limit);
        }
        data = projectColumns(data, this.parsed);
      }

      if (this.parsed.distinct) {
        const seen = new Set();
        data = data.filter(row => {
          const key = JSON.stringify(row);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      return data;
    }
    return [];
  }

  run(...params) {
    if (this.parsed.type === 'INSERT') {
      const store = getStore(this.parsed.insertTable);
      if (!store) return { changes: 0 };

      const item = {};
      this.parsed.insertCols.forEach((col, i) => {
        item[col] = params[i];
      });
      store.push(item);
      return { changes: 1 };
    }

    if (this.parsed.type === 'UPDATE') {
      const store = getStore(this.parsed.updateTable);
      if (!store) return { changes: 0 };

      const whereFields = this.parsed.whereClauses;
      const setParamCount = this.parsed.setClauses.filter(s => s.type === 'param').length;
      const setParams = params.slice(0, setParamCount);
      const whereParams = params.slice(setParamCount);

      let changes = 0;
      for (const row of store) {
        let match = true;
        let currentOp = 'AND';
        let wi = 0;
        for (const wc of whereFields) {
          let val;
          if (wc.type === 'param') {
            val = whereParams[wi++];
          } else {
            val = wc.value;
          }
          const rowMatch = matchesWhere(row, wc, val);
          if (currentOp === 'AND') {
            match = match && rowMatch;
          } else {
            match = match || rowMatch;
          }
          currentOp = wc.logicalOp;
        }
        if (match) {
          changes++;
          let si = 0;
          for (const sc of this.parsed.setClauses) {
            if (sc.type === 'param') {
              row[sc.field] = setParams[si++];
            } else if (sc.type === 'inc') {
              row[sc.field] = (row[sc.incField] || 0) + sc.incBy;
            }
          }
        }
      }
      return { changes };
    }

    if (this.parsed.type === 'DELETE') {
      const store = getStore(this.parsed.deleteTable);
      if (!store) return { changes: 0 };

      const whereFields = this.parsed.whereClauses;
      const toRemove = [];
      for (let i = 0; i < store.length; i++) {
        const row = store[i];
        let match = true;
        let currentOp = 'AND';
        let pi = 0;
        for (const wc of whereFields) {
          let val;
          if (wc.type === 'param') {
            val = params[pi++];
          } else {
            val = wc.value;
          }
          const rowMatch = matchesWhere(row, wc, val);
          if (currentOp === 'AND') {
            match = match && rowMatch;
          } else {
            match = match || rowMatch;
          }
          currentOp = wc.logicalOp;
        }
        if (match) {
          toRemove.push(i);
        }
      }

      let changes = 0;
      for (let i = toRemove.length - 1; i >= 0; i--) {
        store.splice(toRemove[i], 1);
        changes++;
      }

      return { changes };
    }

    return { changes: 0 };
  }
}

// ============== Database object ==============
const db = {
  prepare(sql) {
    const parsed = parseSQL(sql);
    return new Statement(parsed);
  },
};

module.exports = {
  db,
  initDatabase,
};
