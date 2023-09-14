// export function splitCodeAndText(input) {
export function splitCodeAndText(input) {
    var lan_list = [
        "python",
        "javascript",
        "typescript",
        "cpp",
        "css",
        "markup",
        "c",
        "java",
        "html",
    ]
    // 将输入字符串按照代码块分割成数组，如'''python ........ '''代码块
    const blocks = input.split(/(```[a-z]+\n.*?\n```)/s);

    //定义一个空数组用于存储结果
    const result = [];

    //遍历所有的代码块和普通文本，并将它们转化成dict对象，放入result中
    for(let i=0; i<blocks.length; i++) {
        let block = blocks[i];

        //如果是代码块，则进行进一步处理，否则直接添加到result中作为普通文本即可。
        if(block.startsWith("```")) {

            //通过正则表达式提取语言名称（例如javascript）
            const matches = block.match(/^```([a-z]+)\n/);

            //如果匹配到了语言名称，则说明这是一个合法的代码块。否则忽略这个block。（实际上除非是非常奇怪的情况下不会出现这种问题）
            if(matches != null && matches.length >1) {
                if (lan_list.includes(matches[1].toLowerCase())) {
                    let rtn_type = matches[1]

                    // markup不支持html，将html高亮改为javascript高亮
                    if (rtn_type=="html") {
                        rtn_type="javascript"
                    }
                    result.push({
                        type: rtn_type,
                        value: block.slice(matches[0].length, -3)
                    });
                }
                else {
                    result.push({
                        type:"normal_text",
                        value:block
                    });
                }
            }

        } else {
            result.push({type:"normal_text", value:block});
        }
    }

    return result;
}// export {
//     splitCodeAndText
// }
export function test_test() {
    console.log("==========start test===========")
    const regex_url =  /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/ig   //eslint-disable-line no-useless-escape
    var match = regex_url.exec("https://source.unsplash.com/640x480/?<\"greenbird\">")
    console.log("======match1=====", match)
    match = regex_url.exec("https://source.unsplash.com/640x480/?<\"greenbird\">")
    console.log("======match2=====", match)
}

export function is_mobile_device() {
    const userAgent = navigator.userAgent.toLowerCase();
    // 是否为移动设备。其中iphone或ipad比较特殊，必须检查是否是多触点才能看出
    if (
        (/ipad|iphone|ipod|android|windows phone|ios|mobile|blackberry|iemobile|mqqbbrooowser|juc|fennec|wosbrowser|browserng|webos|symbian/.test(userAgent)) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    ){
        return true
    }
    else {
        return false
    }
}
// 编写一个js函数，函数的输入是一个字符串，函数将这个字符串切成多个字符串并连接成一个dict数组，字符串切分的依据是将代码块（从```{language}开始，到```结束）前后切开，其中{language}为"javascript"、"python"等语言名称，前述dict为{"type":{language}或"normal_text", "value":{text}}，"normal_text"指不是代码而是普通文本，{text}即字符串内容。
// 如输入为以下字符串时：
// " this is the code i give you:
// '''python
// def print_f():
// return
// '''
// its a python code of print.",
//
// 则函数返回
// [{
//     "type":"normal_text",
//     "value":" this is the code i give you:"
// },
// {
//     "type":"python",
//     "value":"def print_f():return"
// },
// {
//     "type":"normal_text",
//     "value":"its a python code of print."
// }]这样的dict数组。
//
