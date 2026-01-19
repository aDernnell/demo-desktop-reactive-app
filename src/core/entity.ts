import { Framework } from "../bindings";

export enum EntityType {
    FrontendFramework = 'frontend_framework',
    MetaFramework = 'meta_framework',
    MobileDesktop = 'mobile_desktop',
}

export interface FileEntity {
    uid: string;
    path: string;
    name: string;
    homepageUrl: string;
    description: string;
    type: EntityType;
}

export const chunkPayloadToEntities = (chunkContent: { [key: string]: Framework; }): FileEntity[] => {
    return Object.entries(chunkContent).map(([key, item]) => ({
        uid: key,
        path: item.path,
        name: item.name,
        homepageUrl: item.homepage_url,
        description: item.description,
        type: item.entity_type as EntityType,
    }));
};