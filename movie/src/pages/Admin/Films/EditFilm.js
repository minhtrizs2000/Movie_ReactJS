import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    DatePicker,
    InputNumber,
    Switch,
} from 'antd';
import { useFormik } from 'formik';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { GROUPID } from '../../../util/settings/config';
import { capNhatPhimUploadAction, layThongTinPhimAction } from '../../../redux/actions/QuanLyPhimAction';
import * as Yup from 'yup';

const EditFilm = (props) => {

    const [imgSrc, setImgSrc] = useState('');
    const dispatch = useDispatch();
    const { thongTinPhim } = useSelector(state => state.QuanLyPhimReducer);


    useEffect(() => {
        let { id } = props.match.params;
        dispatch(layThongTinPhimAction(id));
    }, []);

    const formik = useFormik({
        enableReinitialize: true, //chỉ nên sd cho 1 form edit duy nhất
        initialValues: {
            maPhim: thongTinPhim.maPhim,
            tenPhim: thongTinPhim.tenPhim,
            trailer: thongTinPhim.trailer,
            moTa: thongTinPhim.moTa,
            ngayKhoiChieu: thongTinPhim.ngayKhoiChieu,
            dangChieu: thongTinPhim.dangChieu,
            sapChieu: thongTinPhim.sapChieu,
            hot: thongTinPhim.hot,
            danhGia: thongTinPhim.danhGia,
            hinhAnh: null,
            maNhom: GROUPID,
        },
        validationSchema: Yup.object().shape({
            tenPhim: Yup.string().required('Tên phim không được bỏ trống!'),
            ngayKhoiChieu: Yup.string().required('Vui lòng chọn ngày khởi chiếu!'),
            danhGia: Yup.number().required('Họ tên không được bỏ trống!').min(1,'Số sao nhỏ nhất là 1, lớn nhất là 10!').max(10,'Số sao nhỏ nhất là 1, lớn nhất là 10!'),
        }),
        onSubmit: (values) => {
            values.maNhom = GROUPID;
            //Tạo đối tượng formdata => Đưa giá trị values từ formik vào formdata
            let formData = new FormData();
            for (let key in values) {
                if (key !== 'hinhAnh') {
                    formData.append(key, values[key]);
                } else {
                    if (values.hinhAnh !== null) {
                        formData.append('File', values.hinhAnh, values.hinhAnh.name);

                    }
                }
            }
            //Cập nhật phim upload hình
            dispatch(capNhatPhimUploadAction(formData));
        },
    });

    //các hàm bắt sự kiện change data từ form và validation
    const handleChangeDatePicker = (value) => {
        let ngayKhoiChieu = moment(value);
        formik.setFieldValue('ngayKhoiChieu', ngayKhoiChieu);
    };
    const handleChangeSwitch = (name) => {
        return (value) => {
            formik.setFieldValue(name, value);
        }
    };
    const handleChangeNumber = (name) => {
        return (value) => {
            formik.setFieldValue(name, value);
        }
    };
    const handleChangeFile = async (e) => {
        //lấy file từ event
        let file = e.target.files[0];

        //Đem dữ liệu file lưu vào formik
        await formik.setFieldValue('hinhAnh', file);
        //tạo đối tượng để đọc file
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            setImgSrc(e.target.result); //Hình dưới dạng base64
        };
    };
    const { handleChange, handleBlur, handleSubmit, touched, errors } = formik;

    return (
        <>
            <Form
                className="rounded-xl border-4 border-yellow-500 w-1/2"
                onSubmitCapture={handleSubmit}
                labelCol={{
                    span: 4,
                }}
                wrapperCol={{
                    span: 12,
                }}
                layout="horizontal"
                initialValues={{
                    size: 'large',
                }}
                size={'large'}
            >
                <h3 className="text-3xl text-yellow-500 m-10">Chỉnh sửa thông tin phim</h3>
                <Form.Item label="Tên Phim">
                    <Input name="tenPhim" onChange={handleChange} value={formik.values.tenPhim} onBlur={handleBlur} />
                    {touched.tenPhim && errors.tenPhim && <p className="text-lg text-red-500">{formik.errors.tenPhim}</p>}
                </Form.Item>
                <Form.Item label="Trailer">
                    <Input name="trailer" onChange={handleChange} value={formik.values.trailer} />
                </Form.Item>
                <Form.Item label="Mô tả">
                    <Input name="moTa" onChange={handleChange} value={formik.values.moTa} />
                </Form.Item>
                <Form.Item label="Ngày khởi chiếu">
                    <DatePicker onChange={handleChangeDatePicker} format="DD/MM/YYYY" value={moment(formik.values.ngayKhoiChieu)} onBlur={handleBlur} />
                    {touched.ngayKhoiChieu && errors.ngayKhoiChieu && <p className="text-lg text-red-500">{formik.errors.ngayKhoiChieu}</p>}
                </Form.Item>
                <Form.Item label="Đang chiếu">
                    <Switch onChange={handleChangeSwitch('dangChieu')} checked={formik.values.dangChieu} />
                </Form.Item>
                <Form.Item label="Sắp chiếu">
                    <Switch onChange={handleChangeSwitch('sapChieu')} checked={formik.values.sapChieu} />
                </Form.Item>
                <Form.Item label="Hot">
                    <Switch onChange={handleChangeSwitch('hot')} checked={formik.values.hot} />
                </Form.Item>
                <Form.Item label="Số sao">
                    <InputNumber onChange={handleChangeNumber('danhGia')} min={1} max={10} value={formik.values.danhGia} onBlur={handleBlur} />
                    {touched.danhGia && errors.danhGia && <p className="text-lg text-red-500">{formik.errors.danhGia}</p>}
                </Form.Item>
                <Form.Item label="Hình ảnh">
                    <input accept="image/*" type="file" onChange={handleChangeFile} /><br />
                    <img style={{ width: '150px', height: '170px' }} src={imgSrc === '' ? thongTinPhim.hinhAnh : imgSrc} alt="..." />
                </Form.Item>

                <Form.Item label="Tác vụ">
                    <button type="submit" className="bg-yellow-500 text-white px-5 py-2 rounded-xl border-2 border-yellow-500 hover:text-yellow-500 hover:bg-white duration-150">Cập nhật</button>
                </Form.Item>
            </Form>
        </>
    );
};

export default EditFilm;