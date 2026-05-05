import { PackageManager } from '../helpers/get-pkg-manager'

export type TemplateType = 'default' | 'minimal' | 'docs' | 'blog'

export const TEMPLATE_TYPES: TemplateType[] = ['default', 'minimal', 'docs', 'blog']

export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  default: 'Multi-page app with navigation, API calls, and composable components',
  minimal: 'Single-page starter with a counter — the simplest way to get going',
  docs: 'Documentation site with sidebar navigation, table of contents, and Markdown pages',
  blog: 'Blog with post listing, individual post pages, tags, and dark mode',
}

export type TemplateMode = 'js' | 'ts'

export interface InstallTemplateArgs {
    appName: string
    root: string
    packageManager: PackageManager
    template: TemplateType
    useGit: boolean;
}