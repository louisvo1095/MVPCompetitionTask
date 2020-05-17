import React from 'react';
import { Segment, Card, Label, Button, Icon } from 'semantic-ui-react';
import moment from 'moment';

export class JobSummaryCard extends React.Component {
    constructor(props) {
        super(props);
        this.handleEditJob = this.handleEditJob.bind(this);
        this.handleCopyJob = this.handleCopyJob.bind(this);
    };

    handleEditJob(jobData) {
        //console.log("edit job:", jobData);
        window.location = "/EditJob/" + jobData.id;
    }

    handleCopyJob(jobData) {
        window.location = "/PostJob/" + jobData.id;
    }

    render() {
        var expiredLabel;
        if (moment.utc() >= moment.utc(this.props.jobData.expiryDate)) {
            expiredLabel =
                <Label color='red' size='tiny' floated='left'>
                    Expired
                </Label>
        } else {
            expiredLabel = null;
        }
        return (
            <Segment vertical>
                <Card>
                    <Card.Content>
                        <Card.Header>{this.props.jobData.title}</Card.Header>
                        <Label as='a' color='black' ribbon='right'>
                            <Icon name='user' />
                            {this.props.jobData.noOfSuggestions}
                        </Label>
                        <Card.Meta>{this.props.jobData.location.city + ", " + this.props.jobData.location.country}</Card.Meta>
                        <Card.Description>
                            {this.props.jobData.summary}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        {expiredLabel}
                        <Button.Group floated='right' size='mini' compact>
                            <Button basic color='blue' onClick={() => this.props.handleCloseJob(this.props.jobData)}>
                                <Icon name='ban' />
                                Close
                            </Button>
                            <Button basic color='blue' onClick={() => this.handleEditJob(this.props.jobData)}>
                                <Icon name='edit' />
                                Edit
                            </Button>
                            <Button basic color='blue' onClick={() => this.handleCopyJob(this.props.jobData)}>
                                <Icon name='copy outline' />
                                Copy
                            </Button>
                        </Button.Group>
                    </Card.Content>
                </Card>
            </Segment>
        )
    }
}