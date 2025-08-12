import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
    
const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}
export default function Login() {
  const [form] = Form.useForm();

  const onFinish = (values: LoginFormValues) => {
    console.log('登录信息:', values);
    // 这里可以添加登录逻辑
  };

  const onFinishFailed = (errorInfo: unknown) => {
    console.log('登录失败:', errorInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <div className="text-center mb-8">
          {/* Logo 区域 */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">L</span>
            </div>
            <Title level={2} className="!mb-2 !text-gray-800">
              欢迎登录
            </Title>
          </div>
        </div>

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          size="large"
          className="space-y-4"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, message: '用户名至少3个字符!' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="请输入用户名"
              className="h-12 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="请输入密码"
              className="h-12 rounded-lg"
            />
          </Form.Item>

          <Form.Item className="!mb-6">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 border-0 rounded-lg font-medium text-base hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        {/* 底部链接 */}
        <div className="text-center space-y-2">
          <div className="flex justify-between text-sm">
            <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
              忘记密码？
            </a>
            <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
              注册账号
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
