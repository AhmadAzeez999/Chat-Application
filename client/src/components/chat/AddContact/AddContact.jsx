import { IoMdPersonAdd } from "react-icons/io";
import { Link } from "react-router-dom";

const AddContact = () => {
    return ( 
        <div className="add-contact">
            <Link to="/search">
                <IoMdPersonAdd/>
            </Link>
        </div> 
    );
}
 
export default AddContact;