import React from 'react';
import Cookies from 'js-cookie';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Container, Pagination, Icon, Dropdown, Segment, Grid, Header, } from 'semantic-ui-react';

const jobFilterOptions = [
    { key: 'showActive', text: 'Active', value: "showActive" },
    { key: 'showClosed', text: 'Closed', value: "showClosed" },
    { key: 'showDraft', text: 'Draft', value: "showDraft" },
    { key: 'showExpired', text: 'Expired', value: "showExpired" },
    { key: 'showUnexpired', text: 'Unexpired', value: "showUnexpired" }
];

const sortOptions = [
    { key: 'desc', text: 'Newest first', value: "desc" },
    { key: 'asc', text: 'Oldest first', value: "asc" }
];

const sortedJobsParams = [
    { key: "activePage", path: ["activePage"] },
    { key: "sortbyDate", path: ["sortBy", "date"] },
    { key: "showActive", path: ["filter", "showActive"] },
    { key: "showClosed", path: ["filter", "showClosed"] },
    { key: "showDraft", path: ["filter", "showDraft"] },
    { key: "showExpired", path: ["filter", "showExpired"] },
    { key: "showUnexpired", path: ["filter", "showUnexpired"] },
    { key: "limit", path: ["limit"] },
];

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            limit: 6,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleCloseJob = this.handleCloseJob.bind(this);
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData });//comment this
        this.loadData(() =>
            this.setState({ loaderData })
        )
    }

    componentDidMount() {
        this.init();
    };

    getObjectValueByPath(object, path, index = 0) {
        if (typeof (object) !== "object"
            || object === null
            || !Array.isArray(path)
            || path.length === 0
            || index + 1 > path.length) return null;
        let node = path[index];
        return index + 1 < path.length ? this.getObjectValueByPath(object[node], path, index + 1) : object[node];
    };

    getSortedJobsParams() {
        let params = [];
        sortedJobsParams.forEach(item => {
            params.push(item.key + "=" + this.getObjectValueByPath(this.state, item.path));
        });
        return params.join("&");
    }

    loadData(callback) {
        //console.log("loadData")
        var link = 'https://mvpservicestalent.azurewebsites.net/listing/listing/getSortedEmployerJobs?' + this.getSortedJobsParams();
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
                if (res.success == true) {
                    this.setState({ totalPages: res.totalCount / this.state.limit, loadJobs: res.myJobs });
                } else {
                    TalentUtil.notification.show(res.message, "error", null, null)
                }
                callback();
            }.bind(this),
            error: function (res) {
                TalentUtil.notification.show(res.status, "error", null, null);
                callback();
            }
        })
    };

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                });
            });
        });
    };

    handleFilterChange(e, { value }) {
        var newFilter = {};
        jobFilterOptions.forEach(item => {
            newFilter[item.key] = false;
        });
        value.forEach(key => {
            newFilter[key] = true;
        });
        this.loadNewData({ filter: newFilter, activePage: 1 });
    };

    getFilterValue() {
        let value = [];
        let filter = this.state.filter;
        jobFilterOptions.forEach(item => {
            if (filter[item.key] === true) value.push(item.value);
        })
        return value;
    };

    handleSortChange(e, { value }) {
        this.loadNewData({ sortBy: { date: value }, activePage: 1 });
    };

    handleChangePage(event, data) {
        const { activePage } = data;
        if (activePage !== this.state.activePage) {
            this.loadNewData({ activePage: activePage });
        }
    };

    handleCloseJob(jobData) {
        //console.log("closeJob", jobData);

        var loader = this.state.loaderData;
        loader.isLoading = true;

        this.setState({ loaderData: loader }, () => {
            $.ajax({
                url: 'https://mvpservicestalent.azurewebsites.net/listing/listing/closeJob',
                headers: {
                    'Authorization': 'Bearer ' + Cookies.get('talentAuthToken'),
                    'Content-Type': 'application/json'
                },
                type: "post",
                data: JSON.stringify(jobData.id),
                dataType: 'json',
                success: function (res) {
                    if (res.success == true) {
                        TalentUtil.notification.show(res.message, "success", null, null);
                        this.loadNewData({});
                    } else {
                        TalentUtil.notification.show(res.message, "error", null, null)
                    }
                    loader.isLoading = false;
                    this.setState({
                        loadData: loader
                    });
                }.bind(this),
                error: function (res) {
                    TalentUtil.notification.show(res.status, "error", null, null);
                    loader.isLoading = false;
                    this.setState({
                        loadData: loader
                    });
                }
            })
        });
    };

    render() {
        var jobRow;
        if (this.state.totalPages === 0) {
            jobRow =
                <Grid.Row>
                    <Grid.Column>
                        No Jobs Found
                    </Grid.Column>
                </Grid.Row>
        } else {
            let jobList = [];
            this.state.loadJobs.forEach(job => {
                jobList.push(
                    <Grid.Column key={job.id} width={5} >
                        <JobSummaryCard key={job.id} jobData={job} handleCloseJob={this.handleCloseJob} />
                    </Grid.Column>
                );
            })
            jobRow =
                <Grid.Row>
                    {jobList}
                </Grid.Row>
        }
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <Segment vertical>
                    <Container>
                        <Grid verticalAlign='middle'>
                            <Grid.Row>
                                <Header size='large'>List of Jobs</Header>
                            </Grid.Row>
                            <Grid.Row>
                                <Icon name='filter' />
                                Filter:
                                <Dropdown
                                    text='Choose filter'

                                    multiple
                                    options={jobFilterOptions}
                                    value={this.getFilterValue()}
                                    onChange={this.handleFilterChange}
                                />

                                <Icon name='calendar alternate outline' />
                                Sort by date:
                                <Dropdown
                                    inline
                                    value={this.state.sortBy.date}
                                    options={sortOptions}
                                    onChange={this.handleSortChange}
                                />
                            </Grid.Row>
                            {jobRow}
                            <Grid.Row centered>
                                <Pagination
                                    activePage={this.state.activePage}
                                    totalPages={this.state.totalPages}
                                    onPageChange={this.handleChangePage}
                                />
                            </Grid.Row>
                        </Grid>
                    </Container>
                </Segment>
            </BodyWrapper>
        )
    }
}