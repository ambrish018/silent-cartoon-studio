// Curated topic-icon set (lucide). Bounded + deterministic: only these names
// render; an unknown name falls back to the abstract motif. The generation
// prompt must pick from this list so videos show topic-relevant imagery
// instead of the generic orbit motif.
import {
  // science
  FlaskConical, Atom, Microscope, Dna, Rocket, Telescope, Magnet, BatteryCharging,
  Leaf, Droplets, Flame, Snowflake, Sun, Cloud, Zap, Thermometer, Sprout, Bug,
  Brain, HeartPulse, Orbit, Waves, Wind, Recycle, TestTube, Beaker, Cpu, Network,
  // maths
  Calculator, Ruler, Shapes, Sigma, Percent, Infinity, Dice5, Compass, Triangle, LayoutGrid,
  // arts-and-crafts
  Palette, Paintbrush, Scissors, PenTool, Camera, Music, Image, Sparkles, Wrench,
  // language-arts
  BookOpen, Pencil, Feather, MessageSquare, Mic, Languages, Type, Newspaper,
  // education / general
  GraduationCap, Lightbulb, School, Backpack, Globe, Puzzle, Trophy, Target, Clock, Gamepad2,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  // science
  flask: FlaskConical, "test-tube": TestTube, beaker: Beaker, atom: Atom,
  microscope: Microscope, dna: Dna, rocket: Rocket, telescope: Telescope,
  magnet: Magnet, battery: BatteryCharging, leaf: Leaf, droplet: Droplets,
  flame: Flame, snowflake: Snowflake, sun: Sun, cloud: Cloud, zap: Zap,
  thermometer: Thermometer, sprout: Sprout, bug: Bug, brain: Brain,
  "heart-pulse": HeartPulse, orbit: Orbit, waves: Waves, wind: Wind,
  recycle: Recycle, cpu: Cpu, network: Network,
  // maths
  calculator: Calculator, ruler: Ruler, shapes: Shapes, sigma: Sigma,
  percent: Percent, infinity: Infinity, dice: Dice5, compass: Compass,
  triangle: Triangle, grid: LayoutGrid,
  // arts-and-crafts
  palette: Palette, brush: Paintbrush, scissors: Scissors, "pen-tool": PenTool,
  camera: Camera, music: Music, image: Image, sparkles: Sparkles, wrench: Wrench,
  // language-arts
  book: BookOpen, pencil: Pencil, feather: Feather, message: MessageSquare,
  mic: Mic, languages: Languages, type: Type, newspaper: Newspaper,
  // education / general
  "graduation-cap": GraduationCap, lightbulb: Lightbulb, school: School,
  backpack: Backpack, globe: Globe, puzzle: Puzzle, trophy: Trophy,
  target: Target, clock: Clock, gamepad: Gamepad2,
};

export const ICON_NAMES = Object.keys(ICONS);
export const hasIcon = (name?: string): boolean => !!name && name in ICONS;
