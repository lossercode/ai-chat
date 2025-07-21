import { useState } from "react";
import Chat from "../chat";
import WelcomeComponent from "../welcome";

export default function MainContent() {
    const [startChat, setStartChat] = useState(false)
    const [firstInputText, setFirstInputText] = useState("")    

    return (
        <div className="w-full h-full flex">
            {
                startChat ? <Chat firstInputText={firstInputText}/> : <WelcomeComponent setStartChat={setStartChat} setFirstInputText={setFirstInputText}/> 
            }
        </div>
    )
}