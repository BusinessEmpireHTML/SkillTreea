/** Check out https://simpleicons.org/?q=html for the icons you can use. */
const BASE_PATH= 'https://cdn.jsdelivr.net/npm/simple-icons@14.0.1/icons/';

function toIconPath(name) {
  return `${BASE_PATH}${name}.svg`;
}

export const skillConfig = {
    skills: [
        // Frontend Development Branch
        {
            id: 1,
            title: 'Web UI Development',
            description: 'Proficient in building seamless, responsive user experiences across devices.',
            iconPath: toIconPath('htmx'),
        },
        {
            id: 2,
            title: 'Cross-Platform Development',
            description: 'Experienced in Android & iOS cross-platform development ensuring consistent user experience.',
            dependsOn: [1],
            iconPath: toIconPath('android'),
        },

        // AI Integration Branch
        {
            id: 3,
            title: 'Generative AI Integration',
            description: 'Expertise in integrating generative AI into existing applications.',
            iconPath: toIconPath('googlegemini'),
        },
        {
            id: 4,
            title: 'AI-Powered Tools',
            description: 'Skilled in developing AI-powered tools that provide contextual and personalized responses.',
            dependsOn: [3],
            iconPath: toIconPath('gnometerminal'),
        },

        // Product Strategy Branch
        {
            id: 5,
            title: 'Product Strategy',
            description: 'Strong product thinking abilities with focus on understanding user needs.',
            iconPath: toIconPath('figma'),
        },
        {
            id: 6,
            title: 'Rapid Prototyping',
            description: 'Proven ability to rapidly prototype and iterate on ideas.',
            dependsOn: [5],
            iconPath: toIconPath('excalidraw'),
        },

        // Reliability Branch
        {
            id: 7,
            title: 'System Reliability',
            description: 'Experienced in implementing systems for reliability and continuous availability.',
            iconPath: toIconPath('amazoncloudwatch'),
        },
        {
            id: 8,
            title: 'Quality Assurance',
            description: 'Strong focus on quality assurance through iterative testing and evaluations.',
            dependsOn: [7],
            iconPath: toIconPath('protodotio'),
        }
    ]
};