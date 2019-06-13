function codeGenerator(originNode, node, res, result) {
  let firstNode = node[0];

  if (firstNode) {
    // console.log(firstNode.value && firstNode.value.type);
    if (firstNode.value && firstNode.value.type === 'Array') {
      firstNode.value.children = [firstNode.value.children[0]]
    }
    res.push(firstNode);
  } else {
    firstNode = res.pop();
    if (!firstNode) {
      return result;
    }
    if (firstNode.children) {
      firstNode.children.shift();
    }
    if (firstNode.value && firstNode.value.children) {
      firstNode.value.children.shift();
    }
  }

  if (firstNode && firstNode.children) {
    return codeGenerator(originNode, firstNode.children, res, result);
  }

  let placeHolder = '';
  if (res.length > 1) {
    placeHolder = '  '.repeat(res.length - 1);
  }

  if (firstNode.value && firstNode.value.children) {
    console.log(placeHolder + firstNode.key.value);
    return codeGenerator(originNode, firstNode.value.children, res, result);
  }

  if (firstNode.value && firstNode.value.value) {
    console.log(placeHolder, firstNode.key && firstNode.key.value, typeof firstNode.value.value);
  } else {
    console.log(placeHolder, firstNode.key && firstNode.key.value, typeof firstNode.value);
  }

  res.pop();

  if (!res.length) return result;

  let lastNode = res[res.length - 1];

  if (lastNode.children && lastNode.children.length) {
    lastNode.children.shift();
    return codeGenerator(originNode, lastNode.children, res, result);
  }

  console.log("\n");

  delete lastNode.children;
  return codeGenerator(originNode, lastNode, res, result);
}

function generator(node) {
  let res = [];
  let result = {};

  if (typeof node === 'object') {
    node = [node];
  }

  let dataSource = JSON.parse(JSON.stringify(node));
  return codeGenerator(node, dataSource, res, result);
}

module.exports = generator;
