import PropTypes from "prop-types"
export default function Input({name, id, type, required, register, errors}){

    return(
        <>
        <label htmlFor={id}>{name}</label>
        <br />
        <input {...register(name)} name={name} id={id} type={type}/>
        <br />
        {errors?.[name] && <span style={{color:"red"}}>{errors?.[name]?.message}</span> }
        <br />  
        </>
    )

}


Input.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string.isRequired,
    required: PropTypes.bool.isRequired,
    setInputsAreValid: PropTypes.func.isRequired
}
