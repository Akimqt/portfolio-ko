import type { ComponentType } from "react";
import { Cpu, Layers, Code2, Database, Server, Palette } from "lucide-react";
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiAngular,
  SiTailwindcss,
  SiBootstrap,
  SiRedux,
  SiVite,
  SiJquery,
  SiThreedotjs,
  SiFramer,
  SiNodedotjs,
  SiExpress,
  SiGo,
  SiPython,
  SiPhp,
  SiRubyonrails,
  SiRuby,
  SiLaravel,
  SiDjango,
  SiFlask,
  SiGraphql,
  SiDotnet,
  SiKotlin,
  SiSwift,
  SiRust,
  SiPostgresql,
  SiMysql,
  SiMariadb,
  SiMongodb,
  SiSqlite,
  SiRedis,
  SiInfluxdb,
  SiFirebase,
  SiSupabase,
  SiFlutter,
  SiDart,
  SiAndroidstudio,
  SiAndroid,
  SiApple,
  SiXcode,
  SiEspressif,
  SiCplusplus,
  SiArduino,
  SiRaspberrypi,
  SiProteus,
  SiEasyeda,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiNpm,
  SiWebpack,
  SiVercel,
  SiNetlify,
  SiMqtt,
  SiPostman,
  SiJira,
  SiTrello,
  SiFigma,
  SiCanva,
  SiLinux,
  SiIntellijidea,
  SiTensorflow,
  SiOpencv,
  SiOpenai,
} from "react-icons/si";

export type TechIconDef = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Sensible default brand color — always editable per tech-stack item. */
  defaultColor: string;
};

// Marks whose official color is black/near-black and would vanish on this
// site's dark navy background use white here instead, same convention
// already established for Next.js/Express in Portfolio.tsx.
export const TECH_ICON_LIBRARY: TechIconDef[] = [
  // Frontend / languages
  { key: "html5", label: "HTML5", icon: SiHtml5, defaultColor: "#E34F26" },
  { key: "css3", label: "CSS3", icon: SiCss, defaultColor: "#1572B6" },
  { key: "javascript", label: "JavaScript", icon: SiJavascript, defaultColor: "#F7DF1E" },
  { key: "typescript", label: "TypeScript", icon: SiTypescript, defaultColor: "#3178C6" },
  { key: "react", label: "React", icon: SiReact, defaultColor: "#61DAFB" },
  { key: "nextjs", label: "Next.js", icon: SiNextdotjs, defaultColor: "#FFFFFF" },
  { key: "vue", label: "Vue.js", icon: SiVuedotjs, defaultColor: "#4FC08D" },
  { key: "angular", label: "Angular", icon: SiAngular, defaultColor: "#DD0031" },
  { key: "tailwind", label: "Tailwind CSS", icon: SiTailwindcss, defaultColor: "#06B6D4" },
  { key: "bootstrap", label: "Bootstrap", icon: SiBootstrap, defaultColor: "#7952B3" },
  { key: "redux", label: "Redux", icon: SiRedux, defaultColor: "#764ABC" },
  { key: "vite", label: "Vite", icon: SiVite, defaultColor: "#646CFF" },
  { key: "jquery", label: "jQuery", icon: SiJquery, defaultColor: "#0769AD" },
  { key: "threejs", label: "Three.js", icon: SiThreedotjs, defaultColor: "#FFFFFF" },
  { key: "framer", label: "Framer Motion", icon: SiFramer, defaultColor: "#FFFFFF" },

  // Backend / languages
  { key: "nodejs", label: "Node.js", icon: SiNodedotjs, defaultColor: "#5FA04E" },
  { key: "express", label: "Express", icon: SiExpress, defaultColor: "#FFFFFF" },
  { key: "go", label: "Go", icon: SiGo, defaultColor: "#00ADD8" },
  { key: "python", label: "Python", icon: SiPython, defaultColor: "#3776AB" },
  { key: "php", label: "PHP", icon: SiPhp, defaultColor: "#777BB4" },
  { key: "rubyonrails", label: "Ruby on Rails", icon: SiRubyonrails, defaultColor: "#CC0000" },
  { key: "ruby", label: "Ruby", icon: SiRuby, defaultColor: "#CC342D" },
  { key: "laravel", label: "Laravel", icon: SiLaravel, defaultColor: "#FF2D20" },
  { key: "django", label: "Django", icon: SiDjango, defaultColor: "#FFFFFF" },
  { key: "flask", label: "Flask", icon: SiFlask, defaultColor: "#FFFFFF" },
  { key: "graphql", label: "GraphQL", icon: SiGraphql, defaultColor: "#E10098" },
  { key: "dotnet", label: ".NET", icon: SiDotnet, defaultColor: "#512BD4" },
  { key: "kotlin", label: "Kotlin", icon: SiKotlin, defaultColor: "#7F52FF" },
  { key: "swift", label: "Swift", icon: SiSwift, defaultColor: "#F05138" },
  { key: "rust", label: "Rust", icon: SiRust, defaultColor: "#FFFFFF" },

  // Databases
  { key: "postgresql", label: "PostgreSQL", icon: SiPostgresql, defaultColor: "#4169E1" },
  { key: "mysql", label: "MySQL", icon: SiMysql, defaultColor: "#4479A1" },
  { key: "mariadb", label: "MariaDB", icon: SiMariadb, defaultColor: "#ABC74A" },
  { key: "mongodb", label: "MongoDB", icon: SiMongodb, defaultColor: "#47A248" },
  { key: "sqlite", label: "SQLite", icon: SiSqlite, defaultColor: "#FFFFFF" },
  { key: "redis", label: "Redis", icon: SiRedis, defaultColor: "#DC382D" },
  { key: "influxdb", label: "InfluxDB", icon: SiInfluxdb, defaultColor: "#22ADF6" },
  { key: "firebase", label: "Firebase", icon: SiFirebase, defaultColor: "#FFCA28" },
  { key: "supabase", label: "Supabase", icon: SiSupabase, defaultColor: "#3ECF8E" },

  // Mobile
  { key: "flutter", label: "Flutter", icon: SiFlutter, defaultColor: "#02569B" },
  { key: "dart", label: "Dart", icon: SiDart, defaultColor: "#0175C2" },
  { key: "androidstudio", label: "Android Studio", icon: SiAndroidstudio, defaultColor: "#3DDC84" },
  { key: "android", label: "Android", icon: SiAndroid, defaultColor: "#3DDC84" },
  { key: "apple", label: "Apple / iOS", icon: SiApple, defaultColor: "#FFFFFF" },
  { key: "xcode", label: "Xcode", icon: SiXcode, defaultColor: "#147EFB" },

  // Hardware / embedded
  { key: "esp32", label: "ESP32 / Espressif", icon: SiEspressif, defaultColor: "#E7352C" },
  { key: "cpp", label: "C/C++", icon: SiCplusplus, defaultColor: "#00599C" },
  { key: "arduino", label: "Arduino", icon: SiArduino, defaultColor: "#00979D" },
  { key: "raspberrypi", label: "Raspberry Pi", icon: SiRaspberrypi, defaultColor: "#A22846" },
  { key: "proteus", label: "Proteus", icon: SiProteus, defaultColor: "#1C79B3" },
  { key: "easyeda", label: "EasyEDA", icon: SiEasyeda, defaultColor: "#1765F6" },
  { key: "circuit", label: "Circuit Design", icon: Cpu, defaultColor: "#447F98" },
  { key: "pcb", label: "PCB Design", icon: Layers, defaultColor: "#447F98" },

  // Tools / platforms
  { key: "docker", label: "Docker", icon: SiDocker, defaultColor: "#2496ED" },
  { key: "kubernetes", label: "Kubernetes", icon: SiKubernetes, defaultColor: "#326CE5" },
  { key: "git", label: "Git", icon: SiGit, defaultColor: "#F03C2E" },
  { key: "github", label: "GitHub", icon: SiGithub, defaultColor: "#FFFFFF" },
  { key: "gitlab", label: "GitLab", icon: SiGitlab, defaultColor: "#FC6D26" },
  { key: "bitbucket", label: "Bitbucket", icon: SiBitbucket, defaultColor: "#0052CC" },
  { key: "npm", label: "npm", icon: SiNpm, defaultColor: "#CB3837" },
  { key: "webpack", label: "Webpack", icon: SiWebpack, defaultColor: "#8DD6F9" },
  { key: "vercel", label: "Vercel", icon: SiVercel, defaultColor: "#FFFFFF" },
  { key: "netlify", label: "Netlify", icon: SiNetlify, defaultColor: "#00C7B7" },
  { key: "mqtt", label: "MQTT", icon: SiMqtt, defaultColor: "#660066" },
  { key: "postman", label: "Postman", icon: SiPostman, defaultColor: "#FF6C37" },
  { key: "jira", label: "Jira", icon: SiJira, defaultColor: "#0052CC" },
  { key: "trello", label: "Trello", icon: SiTrello, defaultColor: "#0079BF" },
  { key: "figma", label: "Figma", icon: SiFigma, defaultColor: "#F24E1E" },
  { key: "canva", label: "Canva", icon: SiCanva, defaultColor: "#00C4CC" },
  { key: "linux", label: "Linux", icon: SiLinux, defaultColor: "#FFFFFF" },
  { key: "intellij", label: "IntelliJ IDEA", icon: SiIntellijidea, defaultColor: "#FE315D" },

  // AI / data
  { key: "tensorflow", label: "TensorFlow", icon: SiTensorflow, defaultColor: "#FF6F00" },
  { key: "opencv", label: "OpenCV", icon: SiOpencv, defaultColor: "#5C3EE8" },
  { key: "openai", label: "OpenAI", icon: SiOpenai, defaultColor: "#FFFFFF" },

  // Generic fallbacks — for anything without a dedicated brand mark
  { key: "generic-code", label: "Other (Code)", icon: Code2, defaultColor: "#447F98" },
  { key: "generic-database", label: "Other (Database)", icon: Database, defaultColor: "#447F98" },
  { key: "generic-server", label: "Other (Server)", icon: Server, defaultColor: "#447F98" },
  { key: "generic-design", label: "Other (Design)", icon: Palette, defaultColor: "#447F98" },
];

const ICON_BY_KEY = new Map(TECH_ICON_LIBRARY.map((i) => [i.key, i]));

export function getTechIcon(key: string): TechIconDef {
  return ICON_BY_KEY.get(key) ?? ICON_BY_KEY.get("generic-code")!;
}
