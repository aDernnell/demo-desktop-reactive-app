import { EntityType, FileEntity } from "../../core/entity";
import { db } from "../../core/db";


export const doQueryWithFilters = (
    nameFilter: string,
    typeFilter: EntityType | undefined
): Promise<FileEntity[]> => {

    return db.entities
        .where('name')
        .startsWithIgnoreCase(nameFilter)
        .and((entity) => (typeFilter ? entity.type === typeFilter : true))
        .toArray();
};