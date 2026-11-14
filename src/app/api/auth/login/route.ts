import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Default admin / admin123
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        user: {
          user_id: 1,
          username: 'admin',
          full_name: 'Quản Trị Viên',
          role_name: 'Super Admin',
          role_id: 1
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

