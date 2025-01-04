# SkillTree
A vanilla JS skill tree component. Can be used on personal websites to show off skills in an interesting UI.
This was originally made for my own website, but I found it didn't quite fit.

![image](https://github.com/user-attachments/assets/085be04e-5549-4326-a45d-622065ff019d)

## Usage

You can simply follow the demo folder for how to use the component. It is as simple as creating a config object and then running:

```
import { skillConfig } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const skillTree = new SkillTree(skillConfig);
  // Mount the skill tree to the container and template
  skillTree.mount('.skills-container', '#skill-template');
});
```

Feel free to implement different templates than the default one I created. 

Please send out a pull request if you'd like to contribute.
