// Select all nodes
const nodes = document.querySelectorAll(".node");

// Iterate over each node
nodes.forEach((node) => {
  node.addEventListener("click", () => {
    // Check if the node is already active
    if (!node.dataset.active) {
      // Activate the clicked node
      node.dataset.active = "true";
      node.classList.add("active");

      // Unlock the child nodes in the next level
      const currentLevel = node.closest(".level");
      const nextLevel = currentLevel.nextElementSibling;

      if (nextLevel) {
        const childNodes = nextLevel.querySelectorAll(".node");
        childNodes.forEach((child) => {
          child.style.opacity = "1";
          child.style.pointerEvents = "all"; // Enable interaction
        });
      }
    }
  });
});

// Initialize the tree with only the first level visible
function initializeTree() {
  const levels = document.querySelectorAll(".level");

  levels.forEach((level, index) => {
    const nodesInLevel = level.querySelectorAll(".node");
    nodesInLevel.forEach((node) => {
      if (index === 0) {
        // Allow interaction with the first level
        node.style.opacity = "1";
        node.style.pointerEvents = "all";
      } else {
        // Lock all other levels initially
        node.style.opacity = "0.5";
        node.style.pointerEvents = "none";
      }
    });
  });
}

// Run the initialization function
initializeTree();
