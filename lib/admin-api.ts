// Mock API functions for admin dashboard
// These will be replaced with actual API calls later

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export type OrderStatus = "Received" | "Preparing" | "Ready" | "Completed";

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  displayName: string;
  tableNumber: string;
  items: Array<{
     itemId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id: string;
  nameEn: string;
  nameJp: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "customer" | "staff" | "admin" | "manager";

export interface User {
  _id: string;
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AuthUser {
  _id: string;
  id: string;
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// Authentication API functions
export async function login(userId: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password }),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to login';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to login');
  }
}

export async function verifyToken(token: string): Promise<{ valid: boolean; user: AuthUser }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to verify token';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to verify token');
  }
}

export async function setPassword(userId: string, password: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password }),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to set password';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to set password');
  }
}

// Helper function to get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

// Helper function to set auth token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_token', token);
}

// Helper function to remove auth token from localStorage
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
}

// Helper function to get auth headers
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Order API functions - Fetch from MongoDb
export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch orders';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch orders');
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<Order> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to update order status';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update order status');
  }
}

// Menu API functions - Fetch from MongoDB via backend only
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch menu items';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch menu items');
  }
}

export async function createMenuItem(item: Omit<MenuItem, "_id" | "createdAt" | "updatedAt">): Promise<MenuItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      // Log response details first
      console.error('Backend error - Status:', response.status, response.statusText);
      console.error('Backend error - Headers:', Object.fromEntries(response.headers.entries()));
      
      let errorMessage = 'Failed to create menu item';
      let errorData: any = null;
      
      try {
        // Clone the response to read it without consuming it
        const responseClone = response.clone();
        const text = await responseClone.text();
        console.error('Backend error - Raw response text:', text);
        
        // Try to parse as JSON
        if (text && text.trim().length > 0) {
          try {
            errorData = JSON.parse(text);
            console.error('Backend error - Parsed JSON:', errorData);
          } catch (jsonError) {
            console.error('Backend error - Not valid JSON, using text as error message');
            errorMessage = text || `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          console.error('Backend error - Empty response body');
          errorMessage = `Server error: ${response.status} ${response.statusText} (Empty response)`;
        }
        
        // Extract error message from parsed data
        if (errorData) {
          errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
          
          // If there are missing fields, include them in the error
          if (errorData.missingFields && Array.isArray(errorData.missingFields)) {
            errorMessage = `${errorMessage} (Missing: ${errorData.missingFields.join(', ')})`;
          }
        }
      } catch (parseError) {
        console.error('Backend error - Failed to read response:', parseError);
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create menu item');
  }
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to update menu item';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        errorMessage = `${errorMessage} (Status: ${response.status})`;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update menu item');
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete menu item';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        errorMessage = `${errorMessage} (Status: ${response.status})`;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    // Read the response body to ensure the request is fully processed
    try {
      await response.json();
    } catch {
      // Response might be empty, which is fine
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete menu item');
  }
}

// User Management API Functions
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch users';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch users');
  }
}

export async function createUser(user: Omit<User, "_id" | "createdAt" | "updatedAt" | "totalOrders" | "totalSpent" | "lastOrderDate">): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        if (errorData.missingFields) {
          errorMessage += `: ${errorData.missingFields.join(', ')}`;
        }
        errorMessage = `${errorMessage} (Status: ${response.status})`;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create user');
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to update user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        errorMessage = `${errorMessage} (Status: ${response.status})`;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update user');
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        errorMessage = `${errorMessage} (Status: ${response.status})`;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    // Read the response body to ensure the request is fully processed
    try {
      await response.json();
    } catch {
      // Response might be empty, which is fine
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running on port 5001.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete user');
  }
}

