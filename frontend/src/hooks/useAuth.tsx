import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginRequest, type SignupRequest, type User } from '@/lib/api';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Get current user profile
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!authApi.getStoredUser(), // Only fetch if user exists in localStorage
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], { user: data.user });
      toast.success('Welcome back! 👋');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], { user: data.user });
      toast.success(`Welcome to Devion, ${data.user.name}! 🎉`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Signup failed');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], { user: data.user });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  // Login function
  const login = async (data: LoginRequest) => {
    return loginMutation.mutateAsync(data);
  };

  // Signup function
  const signup = async (data: SignupRequest) => {
    return signupMutation.mutateAsync(data);
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    return updateProfileMutation.mutateAsync(data);
  };

  // Logout function
  const logout = () => {
    queryClient.clear(); // Clear all queries
    authApi.logout();
  };

  return {
    user: userData?.user || authApi.getStoredUser(),
    isLoading: isLoadingUser,
    isAuthenticated: !!userData?.user || !!authApi.getStoredUser(),
    login,
    signup,
    updateProfile,
    logout,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
};

