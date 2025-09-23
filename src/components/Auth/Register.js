// =====================================================
// COMPONENTE DE REGISTRO
// =====================================================
// src/components/Auth/Register.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    website: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [step, setStep] = useState(1); // 1: Dados básicos, 2: Dados da empresa

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erros ao digitar
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setLocalError('');

    // Validações do step 1
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setLocalError('Por favor, insira um email válido');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('As senhas não coincidem');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validações do step 2
    if (!formData.companyName) {
      setLocalError('Nome da empresa é obrigatório');
      return;
    }

    // Preparar dados da empresa
    const companyData = {
      companyName: formData.companyName,
      phone: formData.phone || null,
      website: formData.website || null
    };

    // Tentar registrar
    const result = await register(formData.email, formData.password, companyData);
    
    if (result.success) {
      // Mostrar mensagem de sucesso e redirecionar
      alert(result.message || 'Conta criada com sucesso!');
      navigate('/login');
    } else {
      setLocalError(result.error || 'Erro no registro');
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formatWebsite = (url) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // =====================================================
  // RENDER STEP 1 - DADOS BÁSICOS
  // =====================================================

  const renderStep1 = () => (
    <form className="mt-8 space-y-6" onSubmit={handleStep1Submit}>
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className="flex items-center text-blue-600">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium">Dados de Acesso</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
            <div className="flex items-center text-gray-400">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-gray-600 text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium">Dados da Empresa</span>
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="seu@email.com"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha *
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 sm:text-sm"
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Senha *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Repita sua senha"
          />
        </div>

        {/* Error Message */}
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {localError || error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
        >
          Próximo
          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );

  // =====================================================
  // RENDER STEP 2 - DADOS DA EMPRESA
  // =====================================================

  const renderStep2 = () => (
    <form className="mt-8 space-y-6" onSubmit={handleFinalSubmit}>
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className="flex items-center text-green-600">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full text-white text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium">Dados de Acesso</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-blue-600 rounded"></div>
            <div className="flex items-center text-blue-600">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium">Dados da Empresa</span>
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Empresa *
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            value={formData.companyName}
            onChange={handleChange}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Nome da sua empresa"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            onBlur={(e) => {
              if (e.target.value) {
                setFormData(prev => ({
                  ...prev,
                  website: formatWebsite(e.target.value)
                }));
              }
            }}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="www.suaempresa.com"
          />
        </div>

        {/* Error Message */}
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {localError || error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando conta...
              </>
            ) : (
              <>
                Criar Conta
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crie sua conta gratuita
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
            >
              Faça login aqui
            </Link>
          </p>
        </div>

        {/* Form Steps */}
        {step === 1 ? renderStep1() : renderStep2()}

        {/* Back to home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm text-blue-600 hover:text-blue-500 transition duration-200"
          >
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
