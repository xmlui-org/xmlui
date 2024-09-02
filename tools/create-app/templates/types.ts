import { PackageManager } from '../helpers/get-pkg-manager'

export type TemplateType = 'default'// | 'app' | 'default-tw' | 'app-tw'

export type TemplateMode = 'js' | 'ts'

export interface InstallTemplateArgs {
    appName: string
    root: string
    packageManager: PackageManager
    template: TemplateType
    useGit: boolean;
}