export interface MenuItem {
    label: string;
    icon?: string;
    route?: string;
    permissions?: string[];
    exact?: boolean;
    children?: MenuItem[];
}
