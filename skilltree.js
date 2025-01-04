// Core SkillTree class
export class SkillTree {
    constructor(config) {
        this.config = config;
        this.skills = new Map();
        this.state = {
            isOpen: true,
            avatarName: 'Your Name',
            portrait: Math.ceil(Math.random() * (config.numPortraits || 1)),
            level: 1
        };
        
        this.init();
    }

    init() {
        this.initializeSkills();
        this.bindEvents();
        this.loadFromHash();
    }

    initializeSkills() {
        // Create skill instances
        this.config.skills.forEach(skillData => {
            const skill = new Skill(skillData);
            this.skills.set(skill.id, skill);
        });

        // Wire up dependencies
        this.config.skills.forEach(skillData => {
            if (skillData.dependsOn) {
                const dependent = this.skills.get(skillData.id);
                skillData.dependsOn.forEach(depId => {
                    const dependency = this.skills.get(depId);
                    dependent.addDependency(dependency);
                });
            }
        });
    }

    // State management
    getState() {
        return {
            skills: Array.from(this.skills.values()).map(skill => ({
                id: skill.id,
                points: skill.points
            })),
            portrait: this.state.portrait,
            avatarName: this.state.avatarName
        };
    }

    // Hash management
    generateHash() {
        const state = this.getState();
        return btoa(JSON.stringify(state)); // Base64 encode for URL-friendly hash
    }

    loadFromHash() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            try {
                const state = JSON.parse(atob(hash));
                this.setState(state);
            } catch (e) {
                console.error('Invalid hash state');
            }
        }
    }

    bindEvents() {
        // Listen for hash changes to update the skill tree state
        window.addEventListener('hashchange', () => {
            this.loadFromHash();
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    this.state.isOpen = false;
                    break;
                case 'Enter':
                    this.state.isOpen = true;
                    break;
            }
        });

        // Handle skill point allocation via keyboard
        document.addEventListener('keydown', (e) => {
            if (!this.state.isOpen) return;

            const activeElement = document.activeElement;
            if (!activeElement?.closest('.skill')) return;

            const skillId = Number(activeElement.closest('.skill').dataset.skillId);
            const skill = this.skills.get(skillId);

            if (!skill) return;

            switch(e.key) {
                case '+':
                case '=':
                    if (e.preventDefault) e.preventDefault();
                    skill.addPoint();
                    this.updateHash();
                    break;
                case '-':
                    if (e.preventDefault) e.preventDefault();
                    skill.removePoint();
                    this.updateHash();
                    break;
            }
        });

        // Custom event for skill updates
        this.skillUpdateEvent = new CustomEvent('skilltree:update', {
            bubbles: true,
            detail: {
                skills: this.skills,
                state: this.state
            }
        });

        // Dispatch event when skills are updated
        const dispatchUpdate = () => {
            document.dispatchEvent(this.skillUpdateEvent);
        };

        // Observe skill changes
        this.skills.forEach(skill => {
            Object.defineProperty(skill, 'points', {
                get: function() {
                    return this._points || 0;
                },
                set: function(value) {
                    this._points = value;
                    dispatchUpdate();
                }
            });
        });
    }

    updateHash() {
        const hash = this.generateHash();
        window.location.hash = hash;
    }

    setState(state) {
        if (state.skills) {
            state.skills.forEach(skillState => {
                const skill = this.skills.get(skillState.id);
                if (skill) {
                    skill.points = skillState.points;
                }
            });
        }

        if (state.portrait) {
            this.state.portrait = state.portrait;
        }

        if (state.avatarName) {
            this.state.avatarName = state.avatarName;
        }

        // Dispatch update event
        document.dispatchEvent(this.skillUpdateEvent);
    }

    // Helper methods for state management
    toggleOpen() {
        this.state.isOpen = !this.state.isOpen;
        document.dispatchEvent(this.skillUpdateEvent);
    }

    nextPortrait() {
        this.state.portrait = (this.state.portrait % (this.config.numPortraits || 1)) + 1;
        this.updateHash();
    }

    previousPortrait() {
        this.state.portrait = this.state.portrait <= 1 ? 
            (this.config.numPortraits || 1) : 
            this.state.portrait - 1;
        this.updateHash();
    }

    calculateStats() {
        // Initialize stats with default values from config
        const stats = { ...this.config.defaultStats };

        // Calculate total stats from all skilled points
        this.skills.forEach(skill => {
            if (skill.points > 0) {
                skill.stats.forEach(stat => {
                    // Initialize stat if it doesn't exist
                    if (!stats[stat.title]) {
                        stats[stat.title] = 0;
                    }
                    // Add stat value multiplied by points invested
                    stats[stat.title] += stat.value * skill.points;
                });
            }
        });

        return stats;
    }

    // Helper method to get all active talents
    getTalents() {
        const talents = new Set();
        this.skills.forEach(skill => {
            if (skill.points > 0) {
                skill.talents.forEach(talent => talents.add(talent));
            }
        });
        return Array.from(talents);
    }

    // Helper method to get total points spent
    getTotalPoints() {
        let total = 0;
        this.skills.forEach(skill => {
            total += skill.points;
        });
        return total;
    }

    // Helper method to calculate level based on points
    calculateLevel() {
        const totalPoints = this.getTotalPoints();
        // You can adjust the level calculation formula
        return Math.floor(totalPoints / 3) + 1;
    }
}

// Skill class
class Skill {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.maxPoints = data.maxPoints || 1;
        this.points = 0;
        this.dependencies = new Set();
        this.dependents = new Set();
        this.stats = data.stats || [];
        this.talents = data.talents || [];
        this.rankDescriptions = data.rankDescriptions || [];
        this.icon = data.icon;
    }

    // Add this method
    addDependency(skill) {
        if (skill && skill instanceof Skill) {
            this.dependencies.add(skill);
            skill.dependents.add(this);
        }
    }

    canAddPoint() {
        return this.dependenciesFulfilled() && this.points < this.maxPoints;
    }

    canRemovePoint() {
        return this.points > 0 && 
               (!this.hasUsedDependents() || this.points > 1);
    }

    addPoint() {
        if (this.canAddPoint()) {
            this.points++;
            return true;
        }
        return false;
    }

    removePoint() {
        if (this.canRemovePoint()) {
            this.points--;
            return true;
        }
        return false;
    }

    dependenciesFulfilled() {
        return Array.from(this.dependencies)
            .every(dep => dep.points > 0);
    }

    hasUsedDependents() {
        return Array.from(this.dependents)
            .some(dep => dep.points > 0);
    }

    // Helper methods for UI
    hasPoints() {
        return this.points > 0;
    }

    hasMaxPoints() {
        return this.points >= this.maxPoints;
    }

    hasDependencies() {
        return this.dependencies.size > 0;
    }

    getCurrentRankDescription() {
        return this.rankDescriptions[this.points - 1] || '';
    }

    getNextRankDescription() {
        return this.rankDescriptions[this.points] || '';
    }
}