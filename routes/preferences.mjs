import {ResourceBuilder} from "../core/ResourceBuilder.mjs";
import {getPreferenceDAO} from "../application/services/serverServices.mjs";


export function composePreferences(services) {
    const getDao = req => getPreferenceDAO(services);

    return new ResourceBuilder(
        {
            getDao,
        })
        .create(createGetData, {mapper: createMapResponse})
        .delete()
        .getMany()
        .getOne()
        .done()
}