import axios from "axios";
const BASEURL = "http://localhost:3000";
const serverInstanec = axios.create();
serverInstanec.defaults.baseURL = BASEURL;

/**
 * axios default
 * @param {*} url
 * @param {*} data
 */
const getAxios = (url = "", params = {}, method = "get") => {
    const option = { url, method };
    method == 'get' ? option.params = params : option.data = params;
    return serverInstanec.request(option).then(res => {
        return res.data ? Promise.resolve(res.data.data) : Promise.reject(res);
    });
};

export const getVideoProjections = (id) => {
    return getAxios("/video/getVideoProjections", { id })
}
export const saveVideoProjections = (id, params) => {
    return getAxios("/video/saveVideoProjections", { id, params }, 'post')
}