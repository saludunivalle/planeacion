import React from 'react';

const EditModal = ({ isOpen, onClose, onSave, type, id }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit {type}</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <input type="text" id={`edit-${type}-${id}`} className="form-control" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button type="button" className="btn btn-primary" onClick={() => onSave(type, id)}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
