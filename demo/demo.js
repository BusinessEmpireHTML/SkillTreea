import { SkillTree } from '../skilltree.js';
import { skillConfig } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const skillTree = new SkillTree(skillConfig);
  // Mount the skill tree to the container and template
  skillTree.mount('.skills-container', '#skill-template');
});
