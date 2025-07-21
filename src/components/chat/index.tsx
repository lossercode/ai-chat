import React from "react";
import { Bubble, Sender, useXAgent, useXChat, type BubbleProps } from "@ant-design/x";
import { Button, Card, Flex, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { debounce, isValidJSON } from "../../utils";
import { RightOutlined } from "@ant-design/icons";
import markdownit from "markdown-it";
// import { GPTVisLite } from "@antv/gpt-vis";



type popoverProps = {
    title: string;
    link: string;
    left: number;
    top: number;
    show: boolean;
}
type ref = {
    text: string;
    url: string;
    title: string;
    link: string;
    releaseDate: string;
    releaseTeam: string;
}

type refData = {
    id: string;
    ref: ref[]
}

// 自定义 Popover 组件
const Popover = ({ title, link, left, top, show }: popoverProps) => {
    const [visible, setVisible] = useState(false);
    const [move, setMove] = useState(false)

    const handleMouseMove = () => {
        setMove(true) // 鼠标移动时，设置 move 为 true
    };
    const handleMouseLeave = () => {
        setMove(false) // 鼠标移动时，设置 move 为 true
    };

    useEffect(() => {
        if (show) {
            setVisible(true);
        } else {
            if (!move) { // 只有在鼠标没有移动时才隐藏 Popover
                setVisible(false);
            } else { // 鼠标移动时，不隐藏 Popover
                setVisible(true);
            }
        }
    }, [show, move]); // 监听 show 的变化，控制 Popover 的显示和隐藏

    return (
        <div
            onMouseEnter={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={`absolute max-w-3xs min-h-16 bg-white shadow-md rounded p-2 box-border ${link ? '' : 'cursor-pointer'}`}
                style={{ left: left, top: top, display: visible ? 'block' : 'none' }}
                onClick={() => link ? window.open(link) : void 0}
            >
                <div className="h-full w-full">
                    {title}
                </div>
            </div>
        </div>
    )
};

// const roles: GetProp<typeof Bubble.List, 'roles'> = {
//     ai: {
//         placement: 'start',
//         styles: {
//             content: {
//                 background: '#fff',
//                 fontSize: '16px',
//             },
//         },
//     },
//     local: {
//         placement: 'end',
//         styles: {
//             content: {
//                 fontSize: '16px',
//             },
//         },
//     },
// };


interface ChatProps {
    firstInputText: string;
}

const BASE_URL = '/api/v1/chat/completions'
// const MODEL = 'deepseek-chat'
const MODEL = 'lite'
// const API_KEY = 'Bearer sk-9965b6e2a17547a6affd769eb64306cd'
const API_KEY = 'Bearer oSvLoXYsnHmaUUtgLOtv:wfaAdWgHWSLckWUPztVX'

// const modelRequest = XRequest({
//     baseURL: BASE_URL,
//     model: MODEL,
//     dangerouslyApiKey: API_KEY,
//     /** 🔥🔥 Its dangerously! */
//   });

export default function Chat({ firstInputText }: ChatProps) {
    const [userInput, setUserInput] = useState<string>(''); // 存储用户输入的内容
    const [showRef, setShowRef] = useState<boolean>(false); // 控制引用是否显示
    const [currentId, setCurrentId] = useState<string>('msg_0'); // 存储当前的id
    const [loading, setLoading] = useState<boolean>(true); // 控制loading是否显示

    const [showPopover, setshowPopover] = useState(false);
    const [popoverData, setPopoverData] = useState<Partial<popoverProps>>(); // 存储Popover的数据
    // 先用一个桶全部装起来，后来再优化
    const [refData, setRefData] = useState<refData[]>([]);

    const md = markdownit({ html: true, breaks: true });
    const renderMarkdown: BubbleProps['messageRender'] = (content) => {
        return (
            <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
            // <GPTVisLite>{`${content}`}</GPTVisLite>
        );
    };

    const handleMove = debounce((e: React.MouseEvent<HTMLElement, MouseEvent>, id: string) => {
        if (agent.isRequesting()) return
        console.log('ref', refData)
        const target = e.target as HTMLElement;
        if (target.className.includes("ref_cycle")) {
            // 获取元素文本
            const index = target.textContent?.trim();
            // 从对话里面找
            // const data = refData.find(item => item.id === id)?.ref[Number(index) - 1]; // 根据id获取对应的data
            const data = refData.find(item => item.id === id)?.ref[Number(index) - 1] // 根据id获取对应的data
            setshowPopover(true); // 显示Popover 
            setPopoverData({ left: e.clientX - 30, top: e.clientY + 20, link: data?.link as string, title: data?.title as string }); // 设置Popover的位置
        } else {
            setshowPopover(false); // 隐藏Popover
        }
    }, 100)

    // Agent for request
    const [agent] = useXAgent<string, { message: string }, string>({
        request: async ({ message: userInput }, { onSuccess, onUpdate }) => {
            // 读取不到state bug
            setUserInput('')    // 清空用户输入的内容
            setLoading(true) // 显示loading

            const res = await fetch('http://223.72.199.234:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "message": userInput
                })
            });

            if (!res.ok) { // 如果请求失败，返回错误信息
                setLoading(false) // 隐藏loading
                throw new Error('Network response was not ok');
            }

            setLoading(false) // 隐藏loading

            console.log("响应的是啥东西？", res)

            let { data } = await res.json(); // 解析json格式的

            data = data.split('</think>')[1]

            data = data.replaceAll(/\[\^(\d+)\^\]/g, "<span class='ref_cycle'>$1</span>")

            // 模拟打字机效果
            const fullContent = data.split('<REF>')[0]
            let currentContent = ""

            const id = setInterval(() => {
                currentContent = fullContent.slice(0, currentContent.length + 2);
                onUpdate(currentContent);
                if (currentContent === fullContent) {
                    clearInterval(id);
                    onSuccess([fullContent]);
                }
            }, 10);

            const matches = data.match(/<REF>(.*?)<\/REF>/)
            console.log('matches', matches) // 打印出来看看
            if (matches) { // 如果有匹配到的引用，就将引用的内容放到refData里面
                const matchData = matches[1]
                console.log('matchData', matchData) // 打印出来看看
                if (isValidJSON(matchData)) { // 检查是否是json格式的
                    const jsonData = JSON.parse(matchData); // 解析json格式的
                    setRefData((pre) => [...pre, { id: 'msg_' + (pre.length * 2 + 1), ref: jsonData }]) // 放到refData里面
                }
            }
            setCurrentId((pre) => "msg_" + (Number(pre.split('_')[1]) * 2 + 1)) // 存储当前的id


        }
    })

    // 模拟用户请求
    // let fullContent = '我不知道你说的是什么东西<span class="ref_content_cycle">1</span>@@[{"url":"http://www.baidu.com","text":"这是一个引用"}]@@' + userInput;
    // const refRegex = /@@(.*?)@@/; // 正则表达式，匹配所有的引用，例如[^1]，[^2]，[^3]，以此类推
    // const matches = fullContent.match(refRegex); // 匹配所有的引用，返回一个数组，数组里面的元素是字符串，字符串就是引用的内容，例如[^1]，[^2]，[^3]，以此类推
    // if (matches) { // 如果有匹配到的引用，就将引用的内容放到refData里面
    //     const matchData = matches[1]
    //     if (isValidJSON(matchData)) { // 检查是否是json格式的
    //         const jsonData = JSON.parse(matchData); // 解析json格式的
    //         setCurrentRef(jsonData)
    //         setRefData((pre) => [...pre, { id: 'msg_' + (pre.length * 2 + 1), ref: jsonData }]) // 放到refData里面
    //     }
    // } else {
    //     setCurrentRef([]) // 清空当前的引用
    // }
    // // setMessageCount((pre) => pre + 1); // 消息数量加1
    // setCurrentId((pre) => "msg_" + (Number(pre.split('_')[1]) * 2 + 1)) // 存储当前的id

    // // 模拟打字机效果
    // fullContent = "我不知道你说的是什么东西<span class='ref_content_cycle'>1</span>"
    // let currentContent = ""

    // const id = setInterval(() => {
    //     currentContent = fullContent.slice(0, currentContent.length + 2);
    //     onUpdate(currentContent);
    //     if (currentContent === fullContent) {
    //         clearInterval(id);
    //         onSuccess([fullContent]);
    //     }
    // }, 100);
    //         const res = await fetch('/chat/completions ', {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': 'Bearer sk-9965b6e2a17547a6affd769eb64306cd',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 "stream": true,
    //                 // "max_tokens": 32768,
    //                 // "top_k": 6,
    //                 // "temperature": 1.2,
    //                 "messages": [
    //                     {
    //                         "role": "system",
    //                         "content": `你的每次输出都必须用标准Markdown格式，且符合以下要求：如果引用了相关网页/资源作为参考，需要在回答中标注引用序号，序号格式为：[^1^],并且在你的回答的末尾，你需要通过"[{"url":"","text":""}]"形式列出所有的参考资源，并且添加一个<REF>用来区分正文和引用内容，text为文献/资源的简要介绍，引用序号需要与资源列表一一对应。`
    //                     },
    //                     {
    //                         "role": "user",
    //                         "content": userInput
    //                     }
    //                 ],
    //                 "model": "deepseek-chat",
    //             }),
    //         });

    //         if (!res.ok) {
    //             throw new Error(`HTTP error! status: ${res.status}`);
    //         }
    //         // 不使用流式解析
    //         // setLoading(false) // 隐藏loading
    //         // const response = await res.json(); // 解析返回的内容，找到所有的引用，然后放到refData里面
    //         // let fullContent = response.choices[0].message.content; // 这里的chunk是一个对象，里面有data属性，data属性是一个对象，对象里面有一个choices属性，choices属性是一个数组，数组里面有一个对象，对象里面有一个delta属性，delta属性是一个对象，对象里面有一个content属性，content属性是一个字符串，字符串就是返回的内容
    //         // const refRegex = /<REF>(.*?)<\/REF>/; // 正则表达式，匹配所有的引用，例如[^1]，[^2]，[^3]，以此类推
    //         // const matches = fullContent.match(refRegex); // 匹配所有的引用，返回一个数组，数组里面的元素是字符串，字符串就是引用的内容，例如[^1]，[^2]，[^3]，以此类推
    //         // if (matches) { // 如果有匹配到的引用，就将引用的内容放到refData里面
    //         //     const matchData = matches[1]
    //         //     if (isValidJSON(matchData)) { // 检查是否是json格式的
    //         //         const jsonData = JSON.parse(matchData); // 解析json格式的
    //         //         setRefData((pre) => [...pre, { id: 'msg_' + (pre.length * 2 + 1), ref: jsonData }]) // 放到refData里面
    //         //     }
    //         // }
    //         // // setMessageCount((pre) => pre + 1); // 消息数量加1
    //         // setCurrentId((pre) => "msg_" + (Number(pre.split('_')[1]) * 2 + 1)) // 存储当前的id

    //         // // 分割内容
    //         // fullContent = fullContent.split('</REF>')[1] || fullContent; // 分割内容，只保留后面的内容
    //         // // 模拟打字机效果
    //         // let currentContent = ""; // 用于存储assistant的内容
    //         // const id = setInterval(() => {
    //         //     currentContent = fullContent.slice(0, currentContent.length + 2);
    //         //     onUpdate(currentContent);
    //         //     if (currentContent === fullContent) {
    //         //         clearInterval(id);
    //         //         onSuccess([fullContent]);
    //         //     }
    //         // }, 50);

    //         // // 发送请求，然后把引用的内容放到refData里面
    //         let assistantContent = ''; // 用于存储assistant的内容
    //         let refContent = ''
    //         let hasContent = false; // 用于判断是否已经输出了conten
    //         let flag = false
    //         for await (const chunk of XStream({
    //             readableStream: res.body as ReadableStream,
    //         })) {
    //             if(!isValidJSON(chunk.data)){
    //                 continue;
    //             }
    //             const data = JSON.parse(chunk.data); 
    //             if (!data.choices) {
    //                continue; 
    //             }
    //             const content = data.choices[0].delta.content; 
    //             if (!content) {
    //                 continue; 
    //             } 
    //             if(!hasContent){
    //                 setLoading(false) // 隐藏loading
    //                 hasContent = true;
    //             }
    //             assistantContent += content; // 存储assistant的内容
    //             assistantContent = assistantContent.replaceAll(/\[\^(\d+)\^\]/g, "<span class='ref_cycle'>$1</span>")
    //             if(assistantContent.includes('<REF>')){ // 如果包含<REF>，说明正文回答已经结束
    //                 const [pre, after] = assistantContent.split('<REF>'); // 分割内容，只保留后面的内容
    //                 assistantContent = pre || assistantContent; // 分割内容，只保留后面的内容
    //                 onUpdate(assistantContent); // 调用onUpdate方法，将assistant的内容发送给onUpdate方法
    //                 refContent += (after || ''); // 分割内容，只保留后面的内容
    //                 flag = true; // 标记引用已经结束了
    //                 continue;
    //             }
    //             if(!flag){
    //                 // 这里有一个优化的点，可以记录前一项的输出，减少匹配的次数
    //                 onUpdate(assistantContent); // 调用onUpdate方法，将assistant的内容发送给onUpdate方法
    //             } else {
    //                 refContent += content; // 存储assistant的内容
    //             }
    //         }
    //         refContent = refContent.replaceAll('</REF>','')
    //         onSuccess([assistantContent]); // 调用onSuccess方法，将assistant的内容发送给onSuccess方法
    //         // 解析返回的内容，找到所有的引用，然后放到refData里面
    //         setRefData((pre) => {
    //             return [...pre, { id: 'msg_' + (pre.length * 2 + 1), ref: flag? JSON.parse(refContent) : []}] // 放到refData里面
    //         })
    //         setCurrentId((pre) => "msg_" + (Number(pre.split('_')[1]) * 2 + 1)) // 存储当前的id

    //     },
    // });

    // const [agent] = useXAgent<string, { message: string }, string>({
    //     request: async ({ message: userInput }, { onSuccess, onUpdate }) => {

    //         let assistantContent = ''; // 用于存储assistant的内容
    //         let refContent = ''
    //         let hasContent = false; // 用于判断是否已经输出了conten
    //         let flag = false
    //         await modelRequest.create(
    //             {
    //               messages: [
    //                 {role: 'system',
    //                  content: `
    //                         <任务描述>
    //                             - 你是一个人工智能治理咨询智能助手，你的任务是检索相关内容并向用户解释其询问的基本概念。
    //                             - 你生成的内容引用了哪些检索内容，必须要在生成的内容后面通过[^1^]标记出来，1代表索引为1，并且将最终引用的检索内容通过<REF>[{"index":"","Title":"","Release Date": "","Release Team":"","Link": ""}]</REF>的形式放在最后。
    //                             - 你的回答必须用Markdown格式，并且需要通过加粗、换行等方式保证一定的美观性和可读性。
    //                         <示例>:
    //                             大模型(Large Model)是近年来人工智能领域最具革命性的技术突破之一[^1^]。这些模型通过在海量数据上进行预训练，展现出强大的通用任务解决能力、人类指令遵循能力和复杂推理能力，成为推动新一代人工智能发展的新型基础设施[^2^]。
    //                             <REF>[{"index":"1","Title": "信息安全原理与技术","Release Date": "2019.09","Release Team": "华中科技大学出版社","Link": ""},{"index":"2","Title": "信息安全原理与技术","Release Date": "2019.09",
    //                             "Release Team": "华中科技大学出版社","Link": ""}]</REF>'}`
    //                         },
    //                 { role: 'user', content: userInput }],
    //               stream: true,
    //             },
    //             {
    //               onSuccess: () => {
    //                 setLoading(true) 
    //                 setUserInput('')    // 清空用户输入的内容
    //               },
    //               onError: (error) => {
    //                 setLoading(false) // 隐藏loading
    //                 console.log(error); // 处理错误信息
    //               },
    //               onUpdate: (chunk) => {
    //                 console.log(chunk.data); // 处理每个chunk的数据
    //                 if(!isValidJSON(chunk.data)){
    //                     return;
    //                 }
    //                 const data = JSON.parse(chunk.data);
    //                 if (!data.choices) {
    //                    return;
    //                 }
    //                 const content = data.choices[0].delta.content;
    //                 if (!content) {
    //                     return;
    //                 }
    //                 if(!hasContent){
    //                     setLoading(false) // 隐藏loading
    //                     hasContent = true;
    //                 }
    //                 assistantContent += content; // 存储assistant的内容
    //                 assistantContent = assistantContent.replaceAll(/\[\^(\d+)\^\]/g, "<span class='ref_cycle'>$1</span>")
    //                 if(assistantContent.includes('<REF>')){ // 如果包含<REF>，说明正文回答已经结束
    //                     const [pre, after] = assistantContent.split('<REF>'); // 分割内容，只保留后面的内容
    //                     assistantContent = pre || assistantContent; // 分割内容，只保留后面的内容
    //                     onUpdate(assistantContent); // 调用onUpdate方法，将assistant的内容发送给onUpdate方法
    //                     refContent += (after || ''); // 分割内容，只保留后面的内容
    //                     flag = true; // 标记引用已经结束了
    //                     return;
    //                 } else {
    //                     onUpdate(assistantContent); // 调用onUpdate方法，将assistant的内容发送给onUpdate方法
    //                 }
    //               },
    //               onStream: (controller) => {
    //                 // abortController.current = controller;
    //               },
    //             },
    //           );

    //     },
    // });

    // Chat messages
    const { onRequest, messages } = useXChat({
        agent,
    });

    useEffect(() => {
        onRequest(firstInputText);
        return () => void 0
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstInputText, onRequest])

    const handleLookRef = (id: string) => { // 点击查看引用
        if(currentId !== id){
            return
        } else {
            setShowRef(!showRef) // 控制引用是否显示
        }
    }

    const currentRefData = useMemo(() => {
        return refData.find(item => item.id === currentId)?.ref || []; // 根据id获取对应的data  
    }, [currentId, refData])

    return (
        <>
            <div className="flex flex-1 h-full justify-center">
                <div className="md:w-lg xl:w-4xl h-full flex flex-col">
                    <div className="w-full flex-1 overflow-auto no-scrollbar pb-12">
                        <Flex gap="middle" vertical>
                            {messages.map(({ id, message, status }) => {
                                if (status === 'local') { // 如果是用户输入的消息，就返回一个Bubble组件，否则返回一个Bubble组件
                                    return (
                                        <Bubble key={id} role={status} content={message} styles={{ content: { fontSize: '16px' } }} placement="end"/>
                                    );
                                } else { // 如果是AI返回的消息，就返回一个Bubble组件
                                    return (
                                        <>
                                            <Bubble className="chat-bubble" key={id} role={status} content={renderMarkdown(message)} onMouseMove={(e) => handleMove(e, id)} styles={{ content: { background: '#fff', fontSize: '16px' } }} />
                                            {

                                                // currentId === id ? (agent.isRequesting() ? null : <Button onClick={() => handleLookRef(id as string)} className="w-32 ml-3" icon={<RightOutlined />} iconPosition={'end'}>查看引用</Button>)
                                                //     : 
                                                refData && refData.filter((item) => item.id === id)[0]?.ref?.length > 0 && (
                                                    <Button onClick={() => handleLookRef(id as string)} className="w-32 ml-3" icon={<RightOutlined />} iconPosition={'end'}>查看引用</Button>
                                                )
                                            }

                                        </>
                                    )
                                }
                            })}
                            {
                                loading && <div className="w-full flex justify-start pl-2"><Spin /></div>
                            }
                        </Flex>

                        <Popover {...popoverData as popoverProps} show={showPopover} />

                    </div>
                    <div className="pb-6">
                        <Sender
                            autoSize={{ minRows: 3 }}
                            placeholder="请输入你的消息"
                            onSubmit={(userPrompt: string) => onRequest(userPrompt)}
                            value={userInput}
                            onChange={(v) => {
                                setUserInput(v); // 存储用户输入的内容到userInpu
                            }}
                            loading={agent.isRequesting()} />
                            
                    </div>
                </div>
            </div>
            {
                showRef && currentRefData.length > 0 && (
                    <div className="w-2xs overflow-auto no-scrollbar pr-8">
                        {currentRefData.map((item, index) => (
                            <div key={index} className="mb-4">
                                <div className="bg-white p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div className="ref_cycle top-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex flex-1 flex-wrap">
                                            <div className="font-medium text-gray-800 w-full">{item.title}</div>

                                            <div className="mt-2 w-full flex items-center justify-between">
                                                <div className="text-sm text-gray-600">{`${item.releaseTeam} ${item.releaseDate}`}</div>
                                                {
                                                    item.link && (
                                                        <button className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                                                            onClick={() => window.open(item.link)}>
                                                            查看
                                                        </button>
                                                    )
                                                }
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </>
    )
}