import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Film, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bgImage from '@/assets/images/cinema-bg.png';
import api from '@/lib/api';
import { useUserStore } from '@/stores/user.store';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const fetchMe = useUserStore((state) => state.fetchMe);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
  });

  // ⚡ Redirect if already logged in
  useEffect(() => {
    if (currentUser) {

      currentUser.role === 'admin' ? navigate('/admin') : navigate('/booking');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post(
        `/auth/${isLogin ? 'login' : 'register'}`,
        isLogin
          ? { username: formData.username, password: formData.password }
          : formData,
      );

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      const user = res.data.data;
      // setCurrentUser(user); // store user in Zustand
      fetchMe(); // fetch current user to update Zustand state

      if (isLogin) {
        user.role === 'ADMIN' ? navigate('/admin') : navigate('/booking');
      } else {
        setIsLogin(true);
      }
    } catch {
      setError('Server connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen relative bg-background'>
      {/* Background (desktop only) */}
      <div className='hidden lg:block absolute inset-0 -z-10'>
        <img src={bgImage} className='w-full h-full object-cover opacity-90' />
        <div className='absolute inset-0 bg-background/80' />
      </div>

      {/* Mobile Header */}
      <div className='lg:hidden flex items-center justify-center py-6'>
        <Film className='w-10 h-10 text-primary mr-2' />
        <h1 className='text-2xl font-bold'>
          Lumina <span className='text-primary'>Cinema</span>
        </h1>
      </div>

      <div className='flex min-h-screen lg:grid lg:grid-cols-2'>
        {/* Desktop Branding */}
        <div className='hidden lg:flex flex-col justify-center px-20 text-white'>
          <Film className='w-16 h-16 text-primary mb-6' />
          <h1 className='text-5xl font-bold mb-4'>
            Lumina <span className='text-primary'>Cinema</span>
          </h1>
          <p className='text-lg text-muted-foreground max-w-md'>
            Premium seating, immersive sound, unforgettable experiences.
          </p>
        </div>

        {/* Auth Card */}
        <div className='flex items-center justify-center w-full px-4 sm:px-6'>
          <Card className='w-full max-w-sm sm:max-w-md bg-black/50 backdrop-blur-lg border-white/10'>
            <CardHeader className='space-y-1 text-center'>
              <CardTitle className='text-xl sm:text-2xl'>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className='text-sm'>
                {isLogin ? 'Login to continue' : 'Register to book movies'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-1'>
                  <Label>Username</Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      name='username'
                      className='pl-9'
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className='space-y-1'>
                      <Label>Email</Label>
                      <Input
                        name='email'
                        type='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label>Phone</Label>
                      <Input
                        name='phone'
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                <div className='space-y-1'>
                  <Label>Password</Label>
                  <Input
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {error && (
                  <p className='text-sm text-destructive bg-destructive/10 p-2 rounded'>
                    {error}
                  </p>
                )}

                <Button
                  type='submit'
                  className='w-full h-11 text-base'
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {isLogin ? 'Login' : 'Register'}
                </Button>

                <div className='text-center'>
                  <button
                    type='button'
                    onClick={() => setIsLogin(!isLogin)}
                    className='text-sm text-primary hover:underline'
                  >
                    {isLogin
                      ? "Don't have an account? Register"
                      : 'Already have an account? Login'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
