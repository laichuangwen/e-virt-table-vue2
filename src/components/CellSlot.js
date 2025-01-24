export default {
    functional: true,
    props: {
        cell: Object,
    },
    render(h, self) {
        const { render } = self.props.cell;
        if (typeof render === 'function') {
            return render(h, self.props.cell);
        }
        return '';
    },
};
