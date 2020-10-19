import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PDFDownloadLink, PDFViewer, BlobProvider } from '@react-pdf/renderer';
import { Button } from '@patternfly/react-core';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/esm/actions';
import PDFDocument from './components/PDFDocument';

class DownloadButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            asyncPages: []
        };
    }

    updateAsyncPages() {
        const { asyncFunction } = this.props;

        if (asyncFunction) {
            this.setState({
                asyncPages: []
            }, () => {
                Promise.resolve(asyncFunction()).then(asyncPages => this.setState({
                    asyncPages
                }));
            });
        }
    }

    componentDidMount() {
        const { showButton } = this.props;

        if (!showButton) {
            this.updateAsyncPages();
        }
    }

    render() {
        const {
            addNotification,
            notification,
            fileName,
            label,
            isPreview,
            asyncFunction,
            buttonProps,
            showButton,
            ...props
        } = this.props;

        return (
            <React.Fragment>
                { isPreview
                    ? <PDFViewer>
                        <PDFDocument { ...props } />
                    </PDFViewer>
                    : asyncFunction
                        ? <React.Fragment>
                            { showButton && <Button onClick={this.updateAsyncPages} { ...buttonProps }>{label}</Button> }
                            {this.state.asyncPages.length > 0 && (
                                <BlobProvider document={<PDFDocument { ...props } pages={this.state.asyncPages} />}>
                                    {({ blob, loading }) => {
                                        if (loading && notification) {
                                            addNotification(notification)
                                        }

                                        if (blob) {
                                            const link = document.createElement('a');
                                            link.href = URL.createObjectURL(blob);
                                            link.download = fileName;
                                            document.body.append(link);
                                            link.click();
                                            link.remove();
                                            this.setState({
                                                asyncPages: []
                                            });
                                        }

                                        return <React.Fragment />;
                                    }}
                                </BlobProvider>
                            )}
                        </React.Fragment>
                        : <PDFDownloadLink
                            document={<PDFDocument { ...props } />}
                            fileName={fileName}
                            {...props}
                        >
                            {label}
                        </PDFDownloadLink>
                }
            </React.Fragment>
        );
    }
}

DownloadButton.propTypes = {
    ...PDFDocument.propTypes,
    fileName: PropTypes.string,
    isPreview: PropTypes.bool,
    label: PropTypes.node,
    asyncFunction: PropTypes.func,
    showButton: PropTypes.bool,
    notification: PropTypes.shape({
        variant: PropTypes.string,
        dismissable: PropTypes.bool,
        title: PropTypes.string,
        description: PropTypes.string
    }),
};

DownloadButton.defaultProps = {
    ...PDFDocument.defaultProps,
    fileName: '',
    label: 'Download PDF',
    isPreview: false,
    showButton: true
};

const mapDispatchToProps = dispatch => ({
    addNotification: notification => dispatch(addNotification(notification))
});

export default connect(() => ({}), mapDispatchToProps)(DownloadButton)
