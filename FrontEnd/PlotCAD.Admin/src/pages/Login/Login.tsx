import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthApi from "../../api/Auth";
import useAuth from "../../contexts/hooks/useAuth";
import { IManager } from "../../types/auth.types";
import { LoginFormData, loginSchema } from "./Login.schema";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { setCurrentManager } = useAuth();
  const { login, me } = AuthApi();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    const loginResponse = await login(data);
    if (!loginResponse.success) {
      setError(loginResponse.message);
      return;
    }

    const meResponse = await me();
    if (!meResponse.success || !meResponse.data) {
      setError(meResponse.message);
      return;
    }

    setCurrentManager(meResponse.data as IManager);
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-100">
      <div className="flex flex-col items-center w-full max-w-[380px] mx-4 bg-gray-50 shadow-[0_10px_20px_rgba(0,0,0,0.15)] rounded-2xl p-8 gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-primary">PlotCAD</span>
          <span className="text-sm text-gray-500">Painel Administrativo</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-6 mt-4 mb-4 w-full"
        >
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-dark"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              {...register("password")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-dark"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password?.message}
              </p>
            )}
          </div>

          {error && (
            <span className="text-center text-sm text-red-500">{error}</span>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-light text-white py-2 rounded-md font-semibold hover:bg-primary transition-all duration-200"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
