import { Sender, Welcome } from "@ant-design/x";

interface WelcomeComponentProps {
    setFirstInputText: (text: string) => void
    setStartChat: (startChat: boolean) => void
}

export default function WelcomeComponent({ setFirstInputText, setStartChat }: WelcomeComponentProps) {

    const handleSubmit = (value: string) => {
        setFirstInputText(value)
        setStartChat(true)  
    }

    return (
        <div className="w-full h-full flex justify-center">
        <div className="md:w-lg xl:w-3xl h-full flex items-center">
            <div className="w-full h-1/2">
                <Welcome
                    icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                    title="您好，我是AI治理大模型"
                    description="你有任何问题，都可以跟我说，我会尽力帮你解决"
                />
                <Sender placeholder="发消息开始聊天" onSubmit={handleSubmit} className='mt-6' autoSize={{minRows: 3}}/>
            </div>
        </div>
        </div>
    )
}   