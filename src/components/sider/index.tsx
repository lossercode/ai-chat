import React from 'react';
import { Button } from 'antd';
import ReactLogo from '@/assets/react.svg';
import { Conversations } from '@ant-design/x';
import type { ConversationsProps } from '@ant-design/x';
import { type GetProp } from 'antd';

const items: GetProp<ConversationsProps, 'items'> = Array.from({ length: 4 }).map((_, index) => ({
  key: `item${index + 1}`,
  label: `Conversation Item ${index + 1}`,
  disabled: index === 3,
}));


const SiderComponent: React.FC = () => {

  return (
    <div className=" text-gray-800 h-screen ">
      {/* 第一部分：logo和“BingAI”字符 */}
      <div className="flex items-center justify-center p-4 border-b border-gray-200">
        <img src={ReactLogo} alt="Logo" className="w-8 h-8 mr-2 text-blue-600 fill-current" />
        <h2 className="text-xl font-semibold">AI治理大模型</h2>
      </div>

      {/* 中间部分：“+新对话”按钮 */}
      <div className="p-4 border-b border-gray-200">
        <Button
          color='primary'
          className='w-full'
          size='large'
          icon={<span className="">+</span>}
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          <span className="">新对话</span>
        </Button>

      </div>


      {/* 最后一部分：历史对话 */}
      {/* <div className="p-4">
        <h3 className="text-sm font-medium mb-2">历史对话</h3>
        <Conversations items={items} />
      </div> */}
    </div>
  );
};

export default SiderComponent;