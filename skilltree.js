document.addEventListener('DOMContentLoaded', () => {
  const nodes = document.querySelectorAll('.skill-node');

  nodes.forEach((node) => {
    const isUnlocked = node.dataset.unlocked === 'true';
    if (isUnlocked) {
      enableNode(node);
    }

    node.addEventListener('click', () => {
      if (node.dataset.unlocked === 'true') {
        unlockChildren(node.dataset.id);
      }
    });
  });

  function enableNode(node) {
    node.dataset.unlocked = 'true';
    node.classList.add('unlocked');
  }

  function unlockChildren(parentId) {
    nodes.forEach((node) => {
      if (node.dataset.parent === parentId) {
        enableNode(node);
      }
    });
  }
});
