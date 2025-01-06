import axios from "axios";
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./FormSchema";
import Input from "./Input";
export default function SignUp() {

    const [isPending, setTransition] = useTransition();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [signInIsSuccessfull, setSignInIsSuccessfull] = useState(false);

    const {register, handleSubmit, formState:{errors}} = useForm({resolver: zodResolver(formSchema)});



    const handleSubmitForm = async (formData) => {
        setTransition(async () => {
            try {
                const response = await axios.post("http://localhost:8080/auth/register",
                    {
                        firstName: formData['first-name'],
                        lastName: formData['last-name'],
                        email: formData['email'],
                        password: formData['password']
                    })
                    if(response.status===200){
                        setError(false)
                        setSignInIsSuccessfull(true);
                    }
            } catch (e) {
                setError(true);
                setSignInIsSuccessfull(false)
                if(e.response){
                    setErrorMessage(e.response.data.message)
                }else{
                    setErrorMessage(e.message)
                }
            }
        })
    }



    return (
        <div className="sign-up">
            <form action={handleSubmit(handleSubmitForm)}>
                <Input name="first-name" id="first-name" type="text" required={true} register={register} errors={errors}/>
                <Input name="last-name" id="last-name" type="text"  required={true} register={register} errors={errors}/>
                <Input name="email" id="email" type="email"  required={true} register={register} errors={errors}/>
                <Input name="password" id="password" type="password"  required={true} register={register} errors={errors}/>
                <Input name="confirm-password" id="confirm-password" type="password"  required={true} register={register} errors={errors}/>
                <button disabled={isPending}  type="submit">Sign up</button>
            </form>
            {error && <span style={{color: 'red'}}>{errorMessage}</span>}
            {signInIsSuccessfull && <span style={{color: 'green'}}>User was successfully registered</span>}
        </div>

    )


}