import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { Layout } from "components/account";
import { userService, alertService } from "services";

export default Login;

function Login() {
  const router = useRouter();

  // form validation rules
  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  // get functions to build form with useForm() hook
  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors } = formState;

  function onSubmit({ email, password }) {
    alertService.clear();
    return userService
      .login(email, password)
      .then(() => {
        // get return url from query parameters or default to '/'
        const returnUrl = router.query.returnUrl || "/";
        router.push(returnUrl).then();
      })
      .catch(alertService.error);
  }

  return (
    <Layout>
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-md-11 login-box">
            <div className="col-lg-12 login-key">
              <i className="fa fa-key" aria-hidden="true"></i>
            </div>
            <div className="col-lg-12 login-title">Ticket Manager</div>

            <div className="col-lg-12 login-form">
              <div className="col-lg-12 login-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <label className="form-control-label">USERNAME</label>
                    <input
                      name="email"
                      type="text"
                      {...register("email")}
                      className={`form-control f-login ${
                        errors.email ? "is-invalid" : ""
                      }`}
                    />
                    <div className="invalid-feedback">
                      {errors.email?.message}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-control-label">PASSWORD</label>
                    <input
                      name="password"
                      type="password"
                      {...register("password")}
                      className={`form-control f-login ${
                        errors.password ? "is-invalid" : ""
                      }`}
                    />
                    <div className="invalid-feedback">
                      {errors.password?.message}
                    </div>
                  </div>

                  <div className="col-lg-12 loginbttm">
                    <div className="col-lg-12 login-btm login-text"></div>
                    <div className="col-lg-12 login-btm login-button">
                      <button
                        disabled={formState.isSubmitting}
                        className="btn btn-warning text-center"
                      >
                        {formState.isSubmitting && (
                          <span className="spinner-border spinner-border-sm me-1"></span>
                        )}
                        Login
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-3 col-md-2"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
