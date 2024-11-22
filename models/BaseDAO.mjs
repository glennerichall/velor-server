import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";
import {identOp} from "velor-utils/utils/functional.mjs";

export class BaseDAO {
    isVO(obj) {
        throw new NotImplementedError();
    }

    conformVO(vo) {
        throw new NotImplementedError();
    }

    makeVO(vo) {
        throw new NotImplementedError();
    }

    insertOne(vo) {
        throw new NotImplementedError();
    }

    selectOne(query) {
        throw new NotImplementedError();
    }

    selectMany(query) {
        throw new NotImplementedError();
    }

    insertMany(list) {
        throw new NotImplementedError();
    }

    async canSave(data) {
        throw new NotImplementedError();
    }

    async loadOne(query) {
        if (!query) {
            return null;
        } else if (this.isVO(query)) {
            return query;
        }

        let vo = await this.selectOne(query);
        if (vo) {
            vo = this.conformVO(vo);
            vo = this.makeVO(vo);
        }

        return vo;
    }

    async loadId(query) {
        if (query.id) {
            return query.id;
        }
        let vo = await this.loadOne(query);
        return vo?.id;
    }

    async loadMany(query) {
        let list = await this.selectMany(query);
        for (let i = 0; i < list.length; i++) {
            let vo = list[i];
            vo = this.conformVO(vo);
            vo = this.makeVO(vo);
            list[i] = vo;
        }
        return list;
    }

    async saveOne(data) {
        let vo = await this.loadOne(data) ?? data;

        if (await this.canSave(vo)) {
            vo = await this.insertOne(vo);
            vo = this.conformVO(vo);
            vo = this.makeVO(vo);
        }
        return vo;
    }
}

export function freezeVo(vo) {
    Object.freeze(vo);
    return vo;
}

const voSymbol = Symbol('VO');

const getIsVO = symbol => (vo) => vo && vo[symbol];

const getCanSaveIfNotVo = (isVo) => async (data) => {
    return !isVo(data);
}

const getMakeVo = symbol => (vo) => {
    vo[symbol] = true;
    freezeVo(vo);
    return vo;
};

export const loadOneBaseOnQuery = getProvider => query => {
    const request = getProvider(query);
    return request(query);
};

export const DAOPolicy = (policy = {}) => {

    const {
        symbol = voSymbol,
        isVO = getIsVO(symbol),
        conformVO = identOp,
        makeVO = getMakeVo(symbol),
        canSave = getCanSaveIfNotVo(isVO),
    } = policy;

    return class extends BaseDAO {
        isVO(obj) {
            return isVO(obj);
        }

        conformVO(vo) {
            return conformVO(vo);
        }

        makeVO(vo) {
            return makeVO(vo);
        }

        async canSave(data) {
            data = await this.loadOne(data);
            return canSave(data);
        }

        insertOne(vo) {
            return dao.insertOne(vo);
        }

        selectOne(query) {
            return dao.selectOne(query);
        }

        selectMany(query) {
            return dao.selectMany(query);
        }

        insertMany(list) {
            return dao.insertMany(list);
        }
    };
}