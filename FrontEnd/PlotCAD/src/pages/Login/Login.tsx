import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "./Login.schema";
import { useNavigate } from "react-router-dom";
import useAuth from "../../contexts/hooks/useAuth";
import AuthApi from "../../api/Auth";
import UserApi from "../../api/User";
import logo from "/logo.png";
import { IUserResponseDto } from "../../types/users.types";

const Login = () => {
	const navigate = useNavigate()

	const { setCurrentUser } = useAuth();
  const { login } = AuthApi();
	const { getCurrentUser } = UserApi();
	const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

	const onSubmit = async (data: LoginFormData) => {
		const response = await login(data);
		if (response.success) {
      const userResponse = await getCurrentUser();
			if (userResponse.success && userResponse.data !== null) {
				setCurrentUser(userResponse.data as IUserResponseDto)
				navigate("/v1/home")
			}
		}
  };

	return (
			<div className="flex items-center justify-center h-screen bg-neutral-100">
				<div className="flex flex-col items-center w-[380px] bg-gray-50 shadow-[0_10px_20px_rgba(0,0,0,0.15)] rounded-2xl p-8 gap-6">
					<div className="flex flex-col items-center">
					<img
							src={logo}
							alt="PlotCAD Logo"
							className="w-32 h-auto mx-auto"
						/>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-y-6 mt-4 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-light text-dark"
					>
						<div>
							<input
								type={"text"}
								placeholder={"Username"}
								{...register("login")}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-dark"
							/>
							{errors.login && (
								<p className="text-red-500 text-sm mt-1">{errors.login.message}</p>
							)}
						</div>
						<div>
							<input
								type={"password"}
								placeholder={"Password"}
								{...register("password")}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-dark"
							/>
							{errors.password && (
								<p className="text-red-500 text-sm mt-1">{errors.password?.message}</p>
							)}
						</div>

						<button 
							type="submit" 
							disabled={isSubmitting}
							className="bg-primary-light text-white py-2 rounded-md font-semibold hover:bg-primary transition-all duration-200"
						>
							Login
						</button>
						{/* {error && <span className="text-center text-sm text-red-500">{error}</span>} */}
					</form>
				</div>
			</div>
	);
};

export default Login;