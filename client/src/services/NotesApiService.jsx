export const NotesApiService = {

    async _handleHttpCall(method, url, body) {
        return await fetch(`http://localhost:4000/${url}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })
    },

    _handleRequestError(result){
        if (!result.ok) {
            throw new Error(`HTTP error! Status: '${result.status}'`);
        }
    },

    async listNotesApi() {
        try {
            const res = await this._handleHttpCall('GET','items');
            this._handleRequestError(res);
            const data = await res.json();
            return data;
        }
        catch (err) {
            return Promise.reject(err)
        }
    },

}