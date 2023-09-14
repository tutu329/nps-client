import axios from "axios";

export default class GPT_Server {
    constructor(name) {
        self.name = name
    }

    get_role_template_list() {
        var send_data = {}
        var rtn_dict = {}
        axios.post('https://powerai.cc/get_role_template_list', send_data).then(response => {
            rtn_dict = response.data;
            console.log(rtn_dict)
            return
        })
    }
}



